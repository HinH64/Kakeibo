import type { InferInsertModel } from "drizzle-orm";
import { currencies, categories, settings } from "./schema.js";

type CurrencyInsert = InferInsertModel<typeof currencies>;
type CategoryInsert = InferInsertModel<typeof categories>;

// ─── Currencies (30 most common) ────────────────────────────────────────────

export const seedCurrencies: CurrencyInsert[] = [
  { code: "USD", symbol: "$", name: "US Dollar", nameZh: "美元", nameJa: "米ドル", decimalPlaces: 2 },
  { code: "EUR", symbol: "€", name: "Euro", nameZh: "歐元", nameJa: "ユーロ", decimalPlaces: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", nameZh: "日圓", nameJa: "日本円", decimalPlaces: 0 },
  { code: "GBP", symbol: "£", name: "British Pound", nameZh: "英鎊", nameJa: "英ポンド", decimalPlaces: 2 },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", nameZh: "新台幣", nameJa: "台湾ドル", decimalPlaces: 0 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", nameZh: "人民幣", nameJa: "中国元", decimalPlaces: 2 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", nameZh: "韓圜", nameJa: "韓国ウォン", decimalPlaces: 0 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", nameZh: "港幣", nameJa: "香港ドル", decimalPlaces: 2 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", nameZh: "新加坡幣", nameJa: "シンガポールドル", decimalPlaces: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", nameZh: "澳幣", nameJa: "豪ドル", decimalPlaces: 2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", nameZh: "加幣", nameJa: "カナダドル", decimalPlaces: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", nameZh: "瑞士法郎", nameJa: "スイスフラン", decimalPlaces: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", nameZh: "紐幣", nameJa: "NZドル", decimalPlaces: 2 },
  { code: "THB", symbol: "฿", name: "Thai Baht", nameZh: "泰銖", nameJa: "タイバーツ", decimalPlaces: 2 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", nameZh: "菲律賓披索", nameJa: "フィリピンペソ", decimalPlaces: 2 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", nameZh: "馬來西亞令吉", nameJa: "マレーシアリンギット", decimalPlaces: 2 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", nameZh: "印尼盾", nameJa: "インドネシアルピア", decimalPlaces: 0 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", nameZh: "越南盾", nameJa: "ベトナムドン", decimalPlaces: 0 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", nameZh: "印度盧比", nameJa: "インドルピー", decimalPlaces: 2 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", nameZh: "墨西哥披索", nameJa: "メキシコペソ", decimalPlaces: 2 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", nameZh: "巴西雷亞爾", nameJa: "ブラジルレアル", decimalPlaces: 2 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", nameZh: "瑞典克朗", nameJa: "スウェーデンクローナ", decimalPlaces: 2 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", nameZh: "挪威克朗", nameJa: "ノルウェークローネ", decimalPlaces: 2 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", nameZh: "丹麥克朗", nameJa: "デンマーククローネ", decimalPlaces: 2 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", nameZh: "波蘭茲羅提", nameJa: "ポーランドズウォティ", decimalPlaces: 2 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", nameZh: "土耳其里拉", nameJa: "トルコリラ", decimalPlaces: 2 },
  { code: "ZAR", symbol: "R", name: "South African Rand", nameZh: "南非蘭特", nameJa: "南アフリカランド", decimalPlaces: 2 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", nameZh: "阿聯酋迪拉姆", nameJa: "UAEディルハム", decimalPlaces: 2 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", nameZh: "沙烏地里亞爾", nameJa: "サウジアラビアリヤル", decimalPlaces: 2 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", nameZh: "俄羅斯盧布", nameJa: "ロシアルーブル", decimalPlaces: 2 },
];

// ─── Default Categories ─────────────────────────────────────────────────────

export const seedCategories: CategoryInsert[] = [
  // Expense categories
  { id: "cat-food", name: "Food & Dining", nameZh: "餐飲", nameJa: "食費", icon: "food", color: "#c27258", type: "expense", sortOrder: 1 },
  { id: "cat-groceries", name: "Groceries", nameZh: "食材雜貨", nameJa: "食料品", icon: "groceries", color: "#c9944a", type: "expense", sortOrder: 2 },
  { id: "cat-transport", name: "Transportation", nameZh: "交通", nameJa: "交通費", icon: "transport", color: "#6588a8", type: "expense", sortOrder: 3 },
  { id: "cat-housing", name: "Housing", nameZh: "居住", nameJa: "住居費", icon: "housing", color: "#5e9a9a", type: "expense", sortOrder: 4 },
  { id: "cat-utilities", name: "Utilities", nameZh: "水電瓦斯", nameJa: "光熱費", icon: "utilities", color: "#b8a44e", type: "expense", sortOrder: 5 },
  { id: "cat-entertainment", name: "Entertainment", nameZh: "娛樂", nameJa: "娯楽費", icon: "entertainment", color: "#9878a8", type: "expense", sortOrder: 6 },
  { id: "cat-shopping", name: "Shopping", nameZh: "購物", nameJa: "買い物", icon: "shopping", color: "#c9944a", type: "expense", sortOrder: 7 },
  { id: "cat-health", name: "Health & Medical", nameZh: "醫療健康", nameJa: "医療費", icon: "health", color: "#b06880", type: "expense", sortOrder: 8 },
  { id: "cat-education", name: "Education", nameZh: "教育", nameJa: "教育費", icon: "education", color: "#7a78a8", type: "expense", sortOrder: 9 },
  { id: "cat-personal", name: "Personal Care", nameZh: "個人護理", nameJa: "身だしなみ", icon: "personal", color: "#b06880", type: "expense", sortOrder: 10 },
  { id: "cat-clothing", name: "Clothing", nameZh: "服飾", nameJa: "衣服", icon: "clothing", color: "#9878a8", type: "expense", sortOrder: 11 },
  { id: "cat-insurance", name: "Insurance", nameZh: "保險", nameJa: "保険", icon: "insurance", color: "#7a756b", type: "expense", sortOrder: 12 },
  { id: "cat-gifts", name: "Gifts & Donations", nameZh: "禮物捐款", nameJa: "贈答・寄付", icon: "gifts", color: "#c9944a", type: "expense", sortOrder: 13 },
  { id: "cat-travel", name: "Travel", nameZh: "旅遊", nameJa: "旅行", icon: "travel", color: "#6b9a6b", type: "expense", sortOrder: 14 },
  { id: "cat-pets", name: "Pets", nameZh: "寵物", nameJa: "ペット", icon: "pets", color: "#b8a44e", type: "expense", sortOrder: 15 },
  { id: "cat-subscriptions", name: "Subscriptions", nameZh: "訂閱服務", nameJa: "サブスク", icon: "subscriptions", color: "#7a78a8", type: "expense", sortOrder: 16 },
  { id: "cat-other-expense", name: "Other Expense", nameZh: "其他支出", nameJa: "その他支出", icon: "other-expense", color: "#7a756b", type: "expense", sortOrder: 99 },
  // Income categories
  { id: "cat-salary", name: "Salary", nameZh: "薪資", nameJa: "給与", icon: "salary", color: "#6b9a6b", type: "income", sortOrder: 1 },
  { id: "cat-freelance", name: "Freelance", nameZh: "接案收入", nameJa: "フリーランス", icon: "freelance", color: "#5e9a9a", type: "income", sortOrder: 2 },
  { id: "cat-investment-income", name: "Investment", nameZh: "投資收入", nameJa: "投資収入", icon: "investment", color: "#6588a8", type: "income", sortOrder: 3 },
  { id: "cat-bonus", name: "Bonus", nameZh: "獎金", nameJa: "ボーナス", icon: "bonus", color: "#9878a8", type: "income", sortOrder: 4 },
  { id: "cat-refund", name: "Refund", nameZh: "退款", nameJa: "返金", icon: "refund", color: "#b8a44e", type: "income", sortOrder: 5 },
  { id: "cat-other-income", name: "Other Income", nameZh: "其他收入", nameJa: "その他収入", icon: "other-income", color: "#7a756b", type: "income", sortOrder: 99 },
];

// ─── Default Settings ───────────────────────────────────────────────────────

export const seedSettings = [
  { key: "reporting_currency", value: "TWD" },
  { key: "theme", value: "system" },
  { key: "locale", value: "zh-TW" },
  { key: "first_day_of_week", value: "1" },
];
