// 收支类型
export const TYPE_MAP = [
    {
        value: '1',
        label: '收入',
    },
    {
        value: '2',
        label: '支出',
    },
];

//  年份
export const YEAR_MAP = '1'.repeat(10).split('1').map((item, index) => ({
    value: 2020 + index,
    label: `${2020 + index}年`,
}));

// 月份
export const MONTH_MAP = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'].map((item, index) => ({
    value: index,
    label: `${item}月`,
}));
