/*
 * 放置数据库相关接口
 */
import { getType } from '../../all-mine/packages/utils/base';

let db = null;

// 初始化数据库
const initDb = () => {
    db.add = (storeName, data) => new Promise((resolve, reject) => {
        const request = db.transaction(storeName, 'readwrite')
            .objectStore(storeName)
            .add(data);
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject();
        };
    });
    /*
     * find 模仿mogoose api
     * query : {
     *   name: '姓名', // 全匹配
     *   title: { $regex: /title/ }, // 正则匹配
     *   age: { $gte: 21, $lte: 65 }, // 范围匹配
     * }
     * sort: {
     *     age: 'asc', // asc正序 desc 倒叙
     * }
     */
    db.find = (storeName, options = {}) => new Promise((resolve, reject) => {
        const query = options.query || {};
        const sort = options.sort || {};
        const request = db.transaction(storeName, 'readonly')
            .objectStore(storeName)
            .openCursor();
        const res = [];
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                const thisItem = {
                    key: cursor.key,
                    ...cursor.value,
                };
                let join = true;
                // 参数查询
                if (Object.keys(query).length) {
                    try {
                        Object.keys(query).forEach((qKey) => {
                            const qValue = query[qKey];
                            if (getType(qValue) === 'Object') {
                                // 高级查询
                                Object.keys(qValue).forEach((i) => {
                                    const iValue = qValue[i];
                                    if (i === '$regex') {
                                        join = new RegExp(iValue).test(thisItem[qKey]);
                                    }
                                    if (i === '$gte') {
                                        join = thisItem[qKey] > iValue;
                                    }
                                    if (i === '$lte') {
                                        join = thisItem[qKey] < iValue;
                                    }
                                    if (!join) {
                                        throw Error();
                                    }
                                });
                            } else {
                                console.log('走这了', qKey, qValue);
                                // 全匹配
                                join = thisItem[qKey] === qValue;
                                if (!join) {
                                    throw Error();
                                }
                            }
                        });
                    // eslint-disable-next-line
                    }catch (e) {}
                }
                if (join) {
                    res.push(thisItem);
                }
                cursor.continue();
            } else {
                // 排序
                if (Object.keys(sort).length && res.length > 1) {
                    const key = Object.keys(sort)[0];
                    const asc = sort[Object.keys(sort)[0]] === 'asc';
                    res.sort((a, b) => (asc ? a[key] - b[key] : b[key] - a[key]));
                }

                resolve(res);
            }
        };
        request.onerror = () => {
            reject();
        };
    });
    db.update = (storeName, data) => new Promise((resolve, reject) => {
        const request = db.transaction([storeName], 'readwrite')
            .objectStore(storeName)
            .put(data);
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject();
        };
    });
    return db;
};

// 连接数据库
export const connectDb = () => new Promise((resolve, reject) => {
    const request = window.indexedDB.open('xcash', 2);
    request.onsuccess = () => {
        db = request.result;
        initDb(db);
        resolve(db);
    };
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('category')) {
            db.createObjectStore('category', { autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('cashItem')) {
            db.createObjectStore('cashItem', { autoIncrement: true });
        }
    };
    request.onerror = (e) => {
        reject(e);
    };
});

// 账单增改查
export const postCashItem = async (cashItem) => {
    await db.add('cashItem', {
        ...cashItem,
    });
};
export const putCashItem = async (cashItem) => {
    await db.update(cashItem);
};
export const getCashItems = async (params) => {
    const {
        type, category, dateStart, dateEnd,
    } = params;
    const { sort, order } = params;
    const getOptions = {
        query: {},
        sort: {},
    };
    // 检索条件
    getOptions.query = {
        date: {},
    };
    if (type) {
        getOptions.query.type = type;
    }
    if (category) {
        getOptions.query.category = category;
    }
    // 日期过滤
    if (dateStart) {
        getOptions.query.date.$gte = dateStart;
    }
    if (dateEnd) {
        getOptions.query.date.$lte = dateEnd;
    }
    if (Object.keys(getOptions.query.date) < 1) {
        delete getOptions.query.date;
    }
    // 排序
    if (sort && order) {
        getOptions.sort[sort] = order;
    }
    const res = await db.find('cashItem', getOptions);
    return res;
};

// 分类增改查
export const postCategory = async ({
    name,
}) => {
    await db.add('category', {
        name,
    });
};
export const putCategory = () => {

};
export const getCategory = async (filter) => {
    const res = await db.find('category', filter);
    return res;
};
