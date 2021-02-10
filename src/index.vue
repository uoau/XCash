<template>
    <div class="page-book">
        <!-- 标题 -->
        <div class="m-title">XCash</div>
        <div class="m-sub-title">开源节流 • 积少成多</div>

        <!-- 账本 -->
        <div class="m-book">
            <!-- 控制栏:过滤/增添按钮 -->
            <div class="m-control">
                <div class="m-control__left">
                    <div class="year">
                        <AmSelect v-model="filter.year">
                            <AmOption
                                v-for="item in yearOptions"
                                :key="item.value"
                                :item="item"
                            >
                                {{ item.label }}
                            </AmOption>
                        </AmSelect>
                    </div>
                    <div class="month">
                        <AmSelect v-model="filter.month">
                            <AmOption
                                v-for="item in monthOptions"
                                :key="item.value"
                                :item="item"
                            >
                                {{ item.label }}
                            </AmOption>
                        </AmSelect>
                    </div>
                    <div class="type">
                        <AmSelect v-model="filter.nowType">
                            <AmOption
                                :item="{
                                    label: '全部类型',
                                    value: '',
                                }"
                            >
                                全部类型
                            </AmOption>
                            <AmOption
                                v-for="item in typeOptions"
                                :key="item.value"
                                :item="item"
                            >
                                {{ item.label }}
                            </AmOption>
                        </AmSelect>
                    </div>
                    <div class="category">
                        <AmSelect v-model="filter.nowCategory">
                            <AmOption
                                :item="{
                                    value: '',
                                    label: '全部分类'
                                }"
                            >
                                全部分类
                            </AmOption>
                            <AmOption
                                v-for="item in categoryOptions"
                                :key="item.value"
                                :item="item"
                            >
                                {{ item.label }}
                            </AmOption>
                        </AmSelect>
                    </div>
                </div>
                <div class="m-control__right">
                    <!-- 添加分类 -->
                    <div class="btn">
                        <AmIconButton
                            shape="square"
                            icon-name="add"
                            @click="() => { categoryDialog.show = true; }"
                        />
                        <span>导入CSV</span>
                    </div>
                    <!-- 添加分类 -->
                    <div class="btn">
                        <AmIconButton
                            shape="square"
                            icon-name="add"
                            @click="() => { categoryDialog.show = true; }"
                        />
                        <span>加分类</span>
                    </div>
                    <!-- 添加收支 -->
                    <div class="btn">
                        <AmIconButton
                            shape="square"
                            icon-name="add"
                            @click="() => { cashItemDialog.show = true }"
                        />
                        <span>加收支</span>
                    </div>
                </div>
            </div>
            <!-- 表格 -->
            <div class="m-table">
                <AmTable
                    :data="list"
                    :row-class="(row) => ({
                        ['is-income']: row.type === '1',
                    })"
                    height="300px"
                    @sort-change="tableSortChange"
                >
                    <AmTableColumn label="日期" prop="date" width="150px" sort>
                        <template #default="row">
                            <AmDateFormat
                                v-if="row.date"
                                :value="row.date"
                                time-format=""
                                date-format="YYYY年MM月DD日"
                            />
                        </template>
                    </AmTableColumn>
                    <AmTableColumn label="类型" width="90px">
                        <template #default="row">
                            {{ row.typeText }}
                        </template>
                    </AmTableColumn>
                    <AmTableColumn label="分类" width="120px">
                        <template #default="row">
                            {{ row.categoryText }}
                        </template>
                    </AmTableColumn>
                    <AmTableColumn label="金额" width="110px" prop="price" sort>
                        <template #default="row">
                            <div
                                class="m-price"
                                :style="{
                                    color: row.type === '1'?'var(--green)': 'var(--red)'
                                }"
                            >
                                {{ row.type === '1' ? '+': '-' }}{{ row.price }}
                            </div>
                        </template>
                    </AmTableColumn>
                    <AmTableColumn label="备注" width="120px">
                        <template #default="row">
                            {{ row.remark }}
                        </template>
                    </AmTableColumn>
                </AmTable>
            </div>
            <!-- 额外信息 -->
            <div class="m-more-info">
                <div class="left" />
                <div class="right">
                    <ul>
                        <li
                            v-for="(item,index) in total"
                            :key="index"
                        >
                            <span>{{ item.name }}：</span>
                            <p
                                :style="{
                                    color: item.color
                                }"
                            >
                                {{ item.value }}￥
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- 新增分类弹窗 -->
        <AmPopup
            title="新增分类"
            show-close-btn
            :show.sync="categoryDialog.show"
        >
            <template #default>
                <AmForm position="right" label-width="80px">
                    <AmFormItem label="分类：">
                        <AmInput v-model="categoryDialog.name" placeholder="请输入分类名称" />
                    </AmFormItem>
                </AmForm>
            </template>
            <template #ft>
                <AmButton @click="()=>{ categoryDialog.show = false; }">取消</AmButton>
                <AmButton
                    type="primary"
                    :disabled="categoryDialogConfirmDisabled"
                    @click="addCategory"
                >确认添加</AmButton>
            </template>
        </AmPopup>

        <!-- 新增收支项弹窗 -->
        <AmPopup
            title="新增收支项"
            show-close-btn
            :show.sync="cashItemDialog.show"
        >
            <template #default>
                <AmForm position="right" label-width="80px">
                    <AmFormItem label="日期：">
                        <AmDatePicker type="day" v-model="cashItemDialog.date"/>
                    </AmFormItem>
                    <AmFormItem label="类型：">
                        <AmRadio
                            v-for="item in typeOptions"
                            :key="item.value"
                            v-model="cashItemDialog.type"
                            :label="item.value"
                        >{{ item.label }}</AmRadio>
                    </AmFormItem>
                    <AmFormItem label="类目：">
                        <AmSelect v-model="cashItemDialog.category">
                            <AmOption
                                v-for="item in categoryOptions"
                                :key="item.value"
                                :item="item"
                            >
                                {{ item.label }}
                            </AmOption>
                        </AmSelect>
                    </AmFormItem>
                    <AmFormItem label="金额：">
                        <AmInput v-model="cashItemDialog.price" :match="/^\d+(\.\d{1,2})?$|^$/"/>
                    </AmFormItem>
                    <AmFormItem label="备注：">
                        <AmTextarea v-model="cashItemDialog.remark" />
                    </AmFormItem>
                </AmForm>
            </template>
            <template #ft>
                <AmButton @click="()=>{ cashItemDialog.show = false; }">取消</AmButton>
                <AmButton
                    type="primary"
                    :disabled="cashItemDialogConfirmDisabled"
                    @click="addCashItem"
                >确认添加</AmButton>
            </template>
        </AmPopup>
    </div>
</template>

<script>
import dayjs from 'dayjs';
import papaparse from 'papaparse';
import { YEAR_MAP, MONTH_MAP, TYPE_MAP } from './constants';
import {
    connectDb, postCashItem, getCashItems, postCategory, getCategory,
} from './db';

papaparse.parse('http://example.com/file.csv', {
    download: true,
    complete(results) {
        console.log(results);
    },
});

console.log(papaparse);

export default {
    data() {
        return {
            // 选择器选项
            yearOptions: YEAR_MAP,
            monthOptions: MONTH_MAP,
            typeOptions: TYPE_MAP,
            categoryOptions: [],
            // 筛选项
            filter: {
                year: dayjs().$y,
                month: dayjs().$M,
                nowType: '',
                nowCategory: '',
                sort: '',
                order: '',
            },
            // 列表
            list: [],
            // 分类弹窗
            categoryDialog: {
                show: false,
                name: '',
            },
            // 新增收支弹窗
            cashItemDialog: {
                show: false,
                date: new Date(),
                type: '1',
                category: '',
                price: '',
                remark: '',
            },
        };
    },
    computed: {
        total() {
            let imcome = 0;
            let expense = 0;
            this.list.forEach((i) => {
                if (i.type === '1') {
                    imcome += +i.price;
                } else {
                    expense += +i.price;
                }
            });
            const balance = imcome - expense;
            return [
                {
                    name: '收入',
                    value: imcome,
                    color: 'var(--green)',
                }, {
                    name: '支出',
                    value: expense,
                    color: 'var(--red)',
                }, {
                    name: '结余',
                    value: balance,
                    color: balance > 0 ? 'var(--green)' : 'var(--red)',
                },
            ];
        },
        fetchListParams() {
            const {
                nowType, nowCategory, year, month, sort, order,
            } = this.filter;
            const res = {
                type: nowType,
                category: nowCategory,
                dateStart: dayjs(`${year}-${month + 1}`).startOf('month').valueOf(),
                dateEnd: dayjs(`${year}-${month + 1}`).endOf('month').valueOf(),
                sort,
                order,
            };
            return res;
        },
        categoryDialogConfirmDisabled() {
            const { categoryDialog } = this;
            if (!categoryDialog.name) {
                return true;
            }
            return false;
        },
        cashItemDialogConfirmDisabled() {
            const { cashItemDialog } = this;
            if (!cashItemDialog.date || !cashItemDialog.price) {
                return true;
            }
            return false;
        },
    },
    watch: {
        fetchListParams() {
            this.getList();
        },
    },
    async created() {
        // 连接数据库
        await connectDb();
        // 获取分类
        await this.getCategory();
        //
        await this.getList();
    },
    methods: {
        async getCategory() {
            const res = await getCategory();
            this.categoryOptions = res.map((i) => ({
                value: i.key,
                label: i.name,
            }));
            this.cashItemDialog.category = this.categoryOptions[0].value;
        },
        async getList() {
            const res = await getCashItems(this.fetchListParams);
            console.log('res', res);
            this.list = res.map((item) => ({
                ...item,
                typeText: this.typeOptions.find((i) => i.value === item.type)?.label,
                categoryText: this.categoryOptions.find((i) => i.value === item.category)?.label,
            }));
        },
        tableSortChange(sort) {
            console.log(sort, '点击排序');
            this.filter.sort = sort.prop;
            this.filter.order = sort.order;
        },
        addCategory() {
            if (!this.categoryDialog.name) {
                this.$message.fail('请输入分类名');
                return;
            }
            const res = postCategory({
                name: this.categoryDialog.name,
            });
            console.log(res);
            this.$message.success('创建分类成功');
            this.categoryDialog.show = false;
            this.getCategory();
        },
        addCashItem() {
            const {
                type, category, price, remark,
            } = this.cashItemDialog;
            const date = dayjs(this.cashItemDialog.date).valueOf();
            if (!price) {
                this.$message.fail('请输入价格');
                return;
            }
            const res = postCashItem({
                date,
                type,
                category,
                price,
                remark,
            });
            console.log(res);
            this.cashItemDialog.show = false;
        },

    },
};
</script>

<style lang="less">
:root {
    --green: green;
    --red: red;
}
.page-book {
    padding-top: 32px;
    background-image: url(https://s3.cn-north-1.amazonaws.com.cn/assets.xmind.cn/www/assets/images/home/home-hero-lg-3.svg);
    background-position: center;
    background-size: 1920px 1080px;
    background-repeat: no-repeat;
    min-height: 100vh;
    .m-title {
        font-size: 40px;
        text-align: center;
        font-family: 'NeverMind';
        margin-bottom: 8px;
        color: #e23c39;
    }
    .m-sub-title {
        font-size: 24px;
        text-align: center;
        font-family: 'NeverMind';
        margin-bottom: 24px;
        color: #000;
    }
    .m-book {
        width: 800px;
        min-height: 400px;
        margin: auto;
    }
    // 控制栏
    .m-control {
        height: 50px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        &__left {
            display: flex;
            .month, .year {
                margin-right: 8px;
                .am-select {
                    width: 90px;
                }
            }
            .type {
                margin-right: 8px;
                .am-select {
                    width: 120px;
                }
            }
            .category {
                .am-select {
                    width: 120px;
                }
            }
        }
        &__right {
            display: flex;
            .btn {
                display: inline-flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin-left: 16px;
                .am-icon-button {
                    width: 46px;
                    height: 26px;
                    border-radius: 3px;
                }
                > span {
                    font-size: 12px;
                    padding-top: 4px;
                }
            }
        }
    }
    // 表格
    .m-table {
        border: 1px solid #ddd;
        border-radius: 3px 3px 0 0;
        overflow: hidden;
        .am-table {
            &__hd {
                background: #fafafb;
            }
            &__bd {
                background: #fff;
                tr {
                    &:hover {
                        background: #fff;
                    }
                    &:last-child {
                        border-bottom: none;
                    }
                }
            }
        }
    }
    // 额外信息
    .m-more-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 50px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 3px 3px;
        .left {

        }
        .right {
            display: flex;
            align-items: center;
            padding-right: 16px;
            ul {
                display: flex;
                li {
                    font-size: 14px;
                    margin-left: 16px;
                    span {

                    }
                    p {
                        display: inline-flex;
                        font-size: 16px;
                        font-family: 'NeverMind';
                    }
                }
            }
        }
    }
    .m-price {
        display: inline-flex;
        font-family: 'NeverMind';
        font-size: 14px;
    }
}

// 组件样式
.am-select {
    &__box {
        border-radius: 3px;
    }
}
.am-input {
    border-radius: 3px;
}
.am-textarea {
    border-radius: 3px;
    overflow: hidden;
}
.am-date-picker {
    &__input {
        border-radius: 3px;
    }
}
</style>
