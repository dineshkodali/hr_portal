
import fs from 'fs';
import path from 'path';

// Helper to get user role and info
async function getUserInfo(pool, userId) {
    const res = await pool.query('SELECT id, name, role, branchIds, linkedEmployeeId FROM users WHERE id = $1', [userId]);
    return res.rows[0] || null;
}

/**
 * AI HR Assistant Service for SD Commercial
 * Provides professional HR support with tool calling and RAG capabilities
 */

// Load documentation for RAG
const DOCS_PATH = path.join(process.cwd(), 'WEBAPP_DOCUMENTATION.md');
let documentationContent = '';

try {
    if (fs.existsSync(DOCS_PATH)) {
        documentationContent = fs.readFileSync(DOCS_PATH, 'utf-8');
        console.log('✅ HR Documentation loaded for AI Assistant');
    } else {
        console.warn('⚠️ WEBAPP_DOCUMENTATION.md not found for AI RAG');
    }
} catch (err) {
    console.error('❌ Failed to load documentation for AI:', err);
}

// Tool Definitions
const TOOLS = {
    get_leave_balance: async (pool, userId) => {
        try {
            // Get system config for default leave year entitlement
            const configRes = await pool.query('SELECT defaultLeaveYear FROM system_config LIMIT 1');
            const annualEntitlement = configRes.rows[0]?.defaultleaveyear || 20;

            // Get approved leaves for this user
            const leavesRes = await pool.query(
                `SELECT SUM(duration) as used 
         FROM leaves 
         WHERE employeeId = (SELECT linkedEmployeeId FROM users WHERE id = $1)
         AND status = 'Approved'`,
                [userId]
            );

            const used = parseInt(leavesRes.rows[0]?.used || 0);
            const balance = annualEntitlement - used;

            return {
                total: annualEntitlement,
                used: used,
                balance: balance,
                unit: 'days'
            };
        } catch (err) {
            console.error('Error in get_leave_balance:', err);
            return null;
        }
    },

    get_holidays: async (pool, userId, limit = 10) => {
        try {
            // Get user's branch to filter holidays
            const userRes = await pool.query(
                `SELECT branchIds FROM users WHERE id = $1`,
                [userId]
            );
            const branchIds = userRes.rows[0]?.branchids || [];
            const branchId = branchIds.length > 0 ? branchIds[0] : null;

            // Get upcoming holidays (next 90 days) for user's branch or company-wide
            const today = new Date().toISOString().split('T')[0];
            const holidaysRes = await pool.query(
                `SELECT name, date, description, type 
                 FROM holidays 
                 WHERE date >= $1 
                 AND (branchId = $2 OR branchId IS NULL)
                 ORDER BY date ASC 
                 LIMIT $3`,
                [today, branchId, limit]
            );

            return holidaysRes.rows.map(h => ({
                name: h.name,
                date: h.date,
                description: h.description || '',
                type: h.type || 'Public'
            }));
        } catch (err) {
            console.error('Error in get_holidays:', err);
            return null;
        }
    }
};

/**
 * Search documentation using keyword matching
 */
const searchDocumentation = (query) => {
    if (!documentationContent) {
        return null;
    }

    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(' ').filter(w =>
        w.length > 3 && !['what', 'how', 'when', 'where', 'does', 'this', 'that', 'with', 'from', 'have'].includes(w)
    );

    if (keywords.length === 0) return null;

    // Split into sections and paragraphs
    const sections = documentationContent.split(/\n## /);
    let bestMatch = null;
    let bestScore = 0;

    for (const section of sections) {
        const paragraphs = section.split('\n\n');
        for (const para of paragraphs) {
            // Skip paragraphs that contain SQL schema or technical database info
            if (para.includes('```sql') ||
                para.includes('Fields:') ||
                para.includes('CREATE TABLE') ||
                para.match(/id,\s*\w+,\s*\w+/)) {
                continue;
            }

            const lowerPara = para.toLowerCase();
            const score = keywords.filter(k => lowerPara.includes(k)).length;

            // Prefer longer, more descriptive paragraphs
            if (score > bestScore && para.length > 100) {
                bestScore = score;
                bestMatch = para;
            }
        }
    }

    if (bestMatch && bestScore > 0) {
        // Clean up the match
        let cleaned = bestMatch
            .replace(/^#+\s*/gm, '')  // Remove markdown headers
            .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
            .replace(/\*\*Table:\*\*.*$/gm, '')  // Remove table references
            .replace(/Fields:.*$/gm, '')  // Remove field lists
            .trim();

        // If still too long, truncate intelligently at sentence boundary
        if (cleaned.length > 600) {
            const truncated = cleaned.substring(0, 600);
            const lastPeriod = truncated.lastIndexOf('.');
            if (lastPeriod > 400) {
                cleaned = truncated.substring(0, lastPeriod + 1);
            } else {
                cleaned = truncated + '...';
            }
        }

        return cleaned;
    }

    return null;
};

/**
 * Process Chat Request
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Object} pool - DB Connection Pool
 */
export const processChatRequest = async (req, res, pool) => {
    try {
        const { message, userId } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const user = await getUserInfo(pool, userId);
        if (!user) return res.status(403).json({ error: 'User not found or unauthorized' });
        console.log(`🤖 AI Request from ${userId} (${user.role}): "${message}"`);
        const lowerMsg = message.toLowerCase();

        // Role-based restrictions helper
        function restrict(text, module) {
            return `🚫 Access Denied\n\nYour role (${user.role}) does not have permission to access ${module} information. If you believe this is an error, please contact your administrator.`;
        }

        // ========================================
        // INTENT 1: Greeting
        // ========================================
        if (lowerMsg.match(/^(hi|hello|hey|greetings|good morning|good afternoon)/)) {
            return res.json({
                response: "Hello! I'm your AI HR Assistant for **SD Commercial**. I can help you with:\n\n• Leave balances and time-off queries\n• HR policies and procedures\n• Benefits and payroll information\n• Hiring and recruitment questions\n\nHow can I assist you today?",
                source: 'AI Assistant'
            });
        }

        // ========================================
        // INTENT 2: Leave Balance (Tool Call)
        // ========================================
        if (lowerMsg.includes('leave') && (
            lowerMsg.includes('balance') ||
            lowerMsg.includes('how many') ||
            lowerMsg.includes('left') ||
            lowerMsg.includes('remaining') ||
            lowerMsg.includes('have')
        )) {
            // Only allow self for employees, team for managers, all for HR/admin
            if (user.role === 'employee' || user.role === 'team_lead') {
                // Only self
                const balanceData = await TOOLS.get_leave_balance(pool, userId);
                if (!balanceData) {
                    return res.json({
                        response: "I apologize, but I'm unable to retrieve your leave balance at the moment. This could be because:\n\n• Your account is not linked to an employee record\n• There's a temporary database issue\n\nPlease contact HR directly or try again later.",
                        source: 'AI Assistant'
                    });
                }
                return res.json({
                    response: `📅 **Your Leave Balance**\n\n• **Remaining:** ${balanceData.balance} days\n• **Used:** ${balanceData.used} days\n• **Annual Entitlement:** ${balanceData.total} days\n\nYou have **${balanceData.balance} days** of annual leave available to use.`,
                    source: 'HR Database'
                });
            } else if (user.role === 'manager' || user.role === 'hr' || user.role === 'admin' || user.role === 'super_admin') {
                // TODO: Support team/department/branch leave balance queries for managers/HR
                // For now, only self
                const balanceData = await TOOLS.get_leave_balance(pool, userId);
                if (!balanceData) {
                    return res.json({
                        response: "I apologize, but I'm unable to retrieve your leave balance at the moment. This could be because:\n\n• Your account is not linked to an employee record\n• There's a temporary database issue\n\nPlease contact HR directly or try again later.",
                        source: 'AI Assistant'
                    });
                }
                return res.json({
                    response: `📅 **Your Leave Balance**\n\n• **Remaining:** ${balanceData.balance} days\n• **Used:** ${balanceData.used} days\n• **Annual Entitlement:** ${balanceData.total} days\n\nYou have **${balanceData.balance} days** of annual leave available to use.`,
                    source: 'HR Database'
                });
            } else {
                return res.json({ response: restrict('leave balance', 'Leave Management'), source: 'Access Control' });
            }
        }

        // ========================================
        // INTENT 3: Holiday Calendar (Tool Call)
        // ========================================
        if (lowerMsg.includes('holiday') ||
            lowerMsg.includes('public holiday') ||
            (lowerMsg.includes('next') && (lowerMsg.includes('holiday') || /\d+\s*holiday/.test(lowerMsg))) ||
            lowerMsg.includes('upcoming holiday') ||
            lowerMsg.includes('show') && lowerMsg.includes('holiday') ||
            (lowerMsg.includes('full list') && (lowerMsg.includes('holiday') || lowerMsg.includes('holidays')))) {
            // All roles can see holidays, but only for their branch if employee
            let limit = 10;
            if (lowerMsg.includes('full list')) limit = 50;
            const numberMatch = message.match(/\b(\d+)\b/);
            if (numberMatch) limit = Math.min(parseInt(numberMatch[1]), 50);
            const holidaysData = await TOOLS.get_holidays(pool, userId, limit);
            if (!holidaysData || holidaysData.length === 0) {
                return res.json({
                    response: "No, there are no upcoming holidays scheduled for your branch at this time. If you need more information, please contact HR.",
                    source: 'HR Database'
                });
            }
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            };
            if (lowerMsg.includes('full list')) {
                // Give a natural, human summary of all holidays
                let summary = `Here is the full list of upcoming holidays for your branch:`;
                summary += '\n\n';
                summary += holidaysData.map((h, i) => `${i + 1}. ${h.name} (${formatDate(h.date)})${h.type ? ` - ${h.type}` : ''}${h.description ? `\n   ${h.description}` : ''}`).join('\n\n');
                summary += '\n\nIf you need details about a specific holiday, just ask!';
                return res.json({
                    response: summary,
                    source: 'HR Database'
                });
            } else {
                let summary = `Yes, there ${holidaysData.length === 1 ? 'is' : 'are'} ${holidaysData.length} upcoming holiday${holidaysData.length === 1 ? '' : 's'} for your branch.`;
                summary += ` The next one is **${holidaysData[0].name}** on ${formatDate(holidaysData[0].date)}.`;
                return res.json({
                    response: summary + '\n\nIf you need the full list or more details, please let me know!',
                    source: 'HR Database'
                });
            }
        }

        // ========================================
        // INTENT 4: Benefits Questions
        // ========================================
        if (lowerMsg.includes('benefit') || lowerMsg.includes('insurance') || lowerMsg.includes('health')) {
            // Only HR, admin, super_admin can see all; others get generic info
            if (['hr', 'admin', 'super_admin'].includes(user.role)) {
                const docAnswer = searchDocumentation(message);
                if (docAnswer) {
                    return res.json({
                        response: `📋 **Benefits Information**\n\n${docAnswer}\n\n*For specific questions about your benefits enrollment, please contact the HR department.*`,
                        source: 'Company Documentation'
                    });
                }
            }
            // Employees get generic info only
            return res.json({
                response: "For benefits information, please contact the HR department. I cannot provide personalized benefits details for your role.",
                source: 'AI Assistant'
            });
        }

        // ========================================
        // INTENT 5: Payroll Questions
        // ========================================
        if (lowerMsg.includes('payroll') || lowerMsg.includes('salary') || lowerMsg.includes('pay')) {
            // Only finance, admin, super_admin can see all; others get generic info
            if (['finance', 'admin', 'super_admin'].includes(user.role)) {
                const docAnswer = searchDocumentation(message);
                if (docAnswer) {
                    return res.json({
                        response: `💰 **Payroll Information**\n\n${docAnswer}\n\n*For specific payroll inquiries, please contact the Finance department.*`,
                        source: 'Company Documentation'
                    });
                }
            }
            // Employees get generic info only
            return res.json({
                response: "For payroll-related questions, please contact the Finance department. I cannot provide personalized payroll details for your role.",
                source: 'AI Assistant'
            });
        }

        // ========================================
        // INTENT 6: Hiring/Recruitment
        // ========================================
        if (lowerMsg.includes('hiring') || lowerMsg.includes('recruit') || lowerMsg.includes('job') || lowerMsg.includes('candidate')) {
            // Only HR, admin, super_admin can see all; others get generic info
            if (['hr', 'admin', 'super_admin'].includes(user.role)) {
                const docAnswer = searchDocumentation(message);
                if (docAnswer) {
                    return res.json({
                        response: `👥 **Recruitment Information**\n\n${docAnswer}`,
                        source: 'Company Documentation'
                    });
                }
            }
            return res.json({
                response: "For recruitment and hiring questions, please refer to the Recruitment module in the portal or contact the HR department. I can provide general policy information if you have specific questions about the hiring process.",
                source: 'AI Assistant'
            });
        }

        // ========================================
        // INTENT 7: General HR Policy (RAG)
        // ========================================
        // Only allow policy/handbook access for employees to public policies, others get more
        const docAnswer = searchDocumentation(message);
        if (docAnswer) {
            if (user.role === 'employee') {
                // Only show if not sensitive (e.g., not payroll, not admin-only)
                if (lowerMsg.includes('payroll') || lowerMsg.includes('salary') || lowerMsg.includes('finance')) {
                    return res.json({ response: restrict('payroll', 'Payroll'), source: 'Access Control' });
                }
            }
            return res.json({
                response: `📚 **From Company Documentation**\n\n${docAnswer}\n\n*If you need more specific information, please contact HR.*`,
                source: 'Company Documentation'
            });
        }

        // ========================================
        // FALLBACK: Unknown Intent
        // ========================================
        return res.json({
            response: "I'm not sure I understand your question. I can help you with:\n\n✓ **Leave balances** - Ask \"How many leaves do I have?\"\n✓ **HR policies** - Ask about attendance, payroll, benefits\n✓ **Portal features** - Ask about specific modules\n\nCould you please rephrase your question or ask about one of these topics?",
            source: 'AI Assistant'
        });

    } catch (err) {
        console.error('❌ AI Service Error:', err);
        res.status(500).json({
            error: 'I apologize, but I encountered an error processing your request. Please try again or contact HR support if the issue persists.'
        });
    }
};
