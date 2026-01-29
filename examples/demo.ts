/**
 * 用户地址信息
 */
export interface Address {
  /** 省份，例如 "广东省"、"浙江省" */
  province: string;

  /** 城市名称，例如 "深圳市"、"杭州市" */
  city: string;

  /** 详细地址，包含街道、门牌号等 */
  detail: string;

  /** 邮政编码，6位数字字符串 */
  zipCode?: string;
}

/**
 * 用户标签
 */
export interface UserTag {
  /** 标签唯一标识 */
  id: number;

  /** 标签名称，例如 "技术爱好者"、"早起达人" */
  name: string;

  /** 标签颜色，十六进制格式如 "#FF5733" */
  color: string;
}

/**
 * 用户资料信息
 * 包含用户的基本信息、偏好设置和关联数据
 */
export interface UserProfile {
  /** 用户唯一ID，UUID格式 */
  id: string;

  /** 用户名，3-20个字符，只允许字母数字下划线 */
  username: string;

  /** 用户邮箱地址，需符合邮箱格式 */
  email: string;

  /** 用户年龄，范围 1-150 */
  age: number;

  /** 账户余额，精确到小数点后两位，单位：元 */
  balance: number;

  /** 是否为VIP用户 */
  isVip: boolean;

  /** 用户等级，必须是 'bronze' | 'silver' | 'gold' | 'platinum' 之一 */
  level: "bronze" | "silver" | "gold" | "platinum";

  /** 用户兴趣爱好列表，每个爱好为字符串 */
  hobbies: string[];

  /** 用户收藏的文章ID列表 */
  favoriteArticleIds: number[];

  /** 用户收货地址 */
  address: Address;

  /** 用户标签列表，用于个性化推荐 */
  tags: UserTag[];

  /** 账户创建时间，ISO 8601 格式 */
  createdAt: string;

  /** 最后登录时间，ISO 8601 格式，新用户可能为空 */
  lastLoginAt?: string;

  /** 用户自定义设置，键值对形式 */
  settings: {
    /** 主题模式：'light' 为浅色，'dark' 为深色 */
    theme: "light" | "dark";

    /** 是否开启消息通知 */
    notifications: boolean;

    /** 界面语言代码，如 'zh-CN'、'en-US' */
    language: string;
  };
}
