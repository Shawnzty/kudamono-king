// Japanese Prefecture Names
export const PREFECTURES = {
  HOKKAIDO: { ja: "北海道", en: "Hokkaido" },
  AOMORI: { ja: "青森県", en: "Aomori" },
  IWATE: { ja: "岩手県", en: "Iwate" },
  MIYAGI: { ja: "宮城県", en: "Miyagi" },
  AKITA: { ja: "秋田県", en: "Akita" },
  YAMAGATA: { ja: "山形県", en: "Yamagata" },
  FUKUSHIMA: { ja: "福島県", en: "Fukushima" },
  IBARAKI: { ja: "茨城県", en: "Ibaraki" },
  TOCHIGI: { ja: "栃木県", en: "Tochigi" },
  GUNMA: { ja: "群馬県", en: "Gunma" },
  SAITAMA: { ja: "埼玉県", en: "Saitama" },
  CHIBA: { ja: "千葉県", en: "Chiba" },
  TOKYO: { ja: "東京都", en: "Tokyo" },
  KANAGAWA: { ja: "神奈川県", en: "Kanagawa" },
  NIIGATA: { ja: "新潟県", en: "Niigata" },
  TOYAMA: { ja: "富山県", en: "Toyama" },
  ISHIKAWA: { ja: "石川県", en: "Ishikawa" },
  FUKUI: { ja: "福井県", en: "Fukui" },
  YAMANASHI: { ja: "山梨県", en: "Yamanashi" },
  NAGANO: { ja: "長野県", en: "Nagano" },
  GIFU: { ja: "岐阜県", en: "Gifu" },
  SHIZUOKA: { ja: "静岡県", en: "Shizuoka" },
  AICHI: { ja: "愛知県", en: "Aichi" },
  MIE: { ja: "三重県", en: "Mie" },
  SHIGA: { ja: "滋賀県", en: "Shiga" },
  KYOTO: { ja: "京都府", en: "Kyoto" },
  OSAKA: { ja: "大阪府", en: "Osaka" },
  HYOGO: { ja: "兵庫県", en: "Hyogo" },
  NARA: { ja: "奈良県", en: "Nara" },
  WAKAYAMA: { ja: "和歌山県", en: "Wakayama" },
  TOTTORI: { ja: "鳥取県", en: "Tottori" },
  SHIMANE: { ja: "島根県", en: "Shimane" },
  OKAYAMA: { ja: "岡山県", en: "Okayama" },
  HIROSHIMA: { ja: "広島県", en: "Hiroshima" },
  YAMAGUCHI: { ja: "山口県", en: "Yamaguchi" },
  TOKUSHIMA: { ja: "徳島県", en: "Tokushima" },
  KAGAWA: { ja: "香川県", en: "Kagawa" },
  EHIME: { ja: "愛媛県", en: "Ehime" },
  KOCHI: { ja: "高知県", en: "Kochi" },
  FUKUOKA: { ja: "福岡県", en: "Fukuoka" },
  SAGA: { ja: "佐賀県", en: "Saga" },
  NAGASAKI: { ja: "長崎県", en: "Nagasaki" },
  KUMAMOTO: { ja: "熊本県", en: "Kumamoto" },
  OITA: { ja: "大分県", en: "Oita" },
  MIYAZAKI: { ja: "宮崎県", en: "Miyazaki" },
  KAGOSHIMA: { ja: "鹿児島県", en: "Kagoshima" },
  OKINAWA: { ja: "沖縄県", en: "Okinawa" },
} as const;

export type PrefectureKey = keyof typeof PREFECTURES;

// Fruit Types with Japanese names
export const FRUIT_TYPES = {
  APPLE: { ja: "りんご", en: "Apple", emoji: "🍎" },
  MANDARIN: { ja: "みかん", en: "Mandarin", emoji: "🍊" },
  GRAPE: { ja: "ぶどう", en: "Grape", emoji: "🍇" },
  PEACH: { ja: "桃", en: "Peach", emoji: "🍑" },
  PEAR: { ja: "梨", en: "Pear", emoji: "🍐" },
  STRAWBERRY: { ja: "いちご", en: "Strawberry", emoji: "🍓" },
  WATERMELON: { ja: "すいか", en: "Watermelon", emoji: "🍉" },
  MELON: { ja: "メロン", en: "Melon", emoji: "🍈" },
  PERSIMMON: { ja: "柿", en: "Persimmon", emoji: "🟠" },
  CHERRY: { ja: "さくらんぼ", en: "Cherry", emoji: "🍒" },
  PLUM: { ja: "梅", en: "Plum", emoji: "🟣" },
  LOQUAT: { ja: "びわ", en: "Loquat", emoji: "🟡" },
  FIG: { ja: "いちじく", en: "Fig", emoji: "🟤" },
  KIWI: { ja: "キウイ", en: "Kiwi", emoji: "🥝" },
  BLUEBERRY: { ja: "ブルーベリー", en: "Blueberry", emoji: "🫐" },
  CITRUS: { ja: "柑橘類", en: "Citrus", emoji: "🍋" },
  OTHER: { ja: "その他", en: "Other", emoji: "🍇" },
} as const;

export type FruitTypeKey = keyof typeof FRUIT_TYPES;

// Price Units
export const PRICE_UNITS = {
  PER_KG: { ja: "kg", en: "kg" },
  PER_PIECE: { ja: "個", en: "piece" },
  PER_BOX: { ja: "箱", en: "box" },
  PER_PACK: { ja: "パック", en: "pack" },
} as const;

export type PriceUnitKey = keyof typeof PRICE_UNITS;

// Listing Status
export const LISTING_STATUS = {
  DRAFT: { ja: "下書き", en: "Draft" },
  ACTIVE: { ja: "出品中", en: "Active" },
  PAUSED: { ja: "一時停止", en: "Paused" },
  SOLD: { ja: "売約済み", en: "Sold" },
  EXPIRED: { ja: "期限切れ", en: "Expired" },
  DELETED: { ja: "削除済み", en: "Deleted" },
} as const;
