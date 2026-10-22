import {
    Modal
} from 'ant-design-vue';
import {
    h
} from 'vue';

import {getPauseRunCycle} from '@/api/modules/base';

export const isWithinDateRange = async() => {
    const resultPauseRunCycle = await getPauseRunCycle();
    const current = new Date();
    let start = new Date(2025, 9, 30, 18, 0, 0); // 2025-10-30 18:00:00
    let end = new Date(2025, 10, 4, 12, 0, 0); // 2025-11-04 12:00:00
    let status = 2; // 1:启用暂停 2:关闭暂停
    let accountList = [];
    if (resultPauseRunCycle.code == 200 && resultPauseRunCycle.data) {
        start = new Date(resultPauseRunCycle.data.startTime);
        end = new Date(resultPauseRunCycle.data.endTime);
        status = resultPauseRunCycle.data.status;
        accountList = resultPauseRunCycle.data.accountList;
    }
    console.log(current >= start && current < end);
    console.log(!accountList.includes(sessionStorage.getItem('userName')));
    console.log(status == 1);
    const result = (current >= start && current < end) && !accountList.includes(sessionStorage.getItem('userName')) && status == 1;
    console.log('result', result);
    if (result) {
        Modal.info({
            title: '温馨提示',
            content: h(
                'div', {
                    class: 'softdog-modal-content',
                },
                [
                    h('p', '该服务升级更新中，敬请期待。'),
                    h(
                        'p', {
                            class: 'softdog-modal-description',
                        },
                        [
                            '',
                            h('div', [
                                '如有问题可联系平台客服：',
                                h(
                                    'span', {
                                        class: 'self-bar',
                                    },
                                    '155-6259-8617',
                                ),
                            ]),
                        ],
                    ),
                ],
            ),
        });
    }
    return result;
}