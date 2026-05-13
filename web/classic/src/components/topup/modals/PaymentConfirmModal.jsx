/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Modal, Typography, Card, Skeleton } from '@douyinfe/semi-ui';
import { SiAlipay, SiWechat, SiStripe } from 'react-icons/si';
import { CreditCard } from 'lucide-react';

const { Text } = Typography;

const VALUE_COLUMN_CLASS =
  'flex min-w-[200px] justify-start text-left text-slate-900 dark:text-slate-100';
const LABEL_CLASS = 'text-[14px] font-semibold text-slate-700 dark:text-slate-200';

function trimZeroDecimal(value) {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(/([¥$¤])(\d+)\.00\b/g, '$1$2');
}

const PaymentConfirmModal = ({
  t,
  open,
  onlineTopUp,
  handleCancel,
  confirmLoading,
  topUpCount,
  renderQuotaWithAmount,
  amountLoading,
  renderAmount,
  payWay,
  payMethods,
  // 新增：用于显示折扣明细
  amountNumber,
  discountRate,
}) => {
  const isStripe = payWay === 'stripe';
  const hasDiscount =
    discountRate && discountRate > 0 && discountRate < 1 && amountNumber > 0;
  const originalAmount = hasDiscount ? amountNumber / discountRate : 0;
  const discountAmount = hasDiscount ? originalAmount - amountNumber : 0;
  const stripeFeeHint =
    isStripe && !amountLoading && amountNumber > 0
      ? `（${t('约4.8%手续费')}）`
      : '';

  const renderPaymentMethod = () => {
    const payMethod = payMethods.find((method) => method.type === payWay);
    const methodName =
      payMethod?.name ||
      (payWay === 'alipay'
        ? t('支付宝')
        : payWay === 'stripe'
          ? 'Stripe'
          : t('微信'));

    const methodType = payMethod?.type || payWay;

    return (
      <div
        className={
          isStripe
            ? `${VALUE_COLUMN_CLASS} items-center gap-2`
            : 'flex items-center justify-end gap-2'
        }
      >
        {methodType === 'alipay' ? (
          <SiAlipay size={18} color='#1677FF' />
        ) : methodType === 'wxpay' ? (
          <SiWechat size={18} color='#07C160' />
        ) : methodType === 'stripe' ? (
          <SiStripe size={18} color='#635BFF' />
        ) : payMethod?.icon ? (
          <img
            src={payMethod.icon}
            alt={methodName}
            style={{
              width: 18,
              height: 18,
              objectFit: 'contain',
            }}
          />
        ) : (
          <CreditCard
            size={18}
            color={payMethod?.color || 'var(--semi-color-text-2)'}
          />
        )}
        <div className='flex items-baseline gap-1'>
          <Text className='text-[14px] font-medium text-slate-900 dark:text-slate-100'>
            {methodName}
          </Text>
          {methodType === 'stripe' && stripeFeeHint && (
            <span
              className='font-normal text-slate-400 dark:text-slate-500'
              style={{ fontSize: 11, lineHeight: '14px' }}
            >
              {stripeFeeHint}
            </span>
          )}
        </div>
      </div>
    );
  };

  const amountRow = (
    <div className='flex justify-between items-center'>
      <Text
        strong={!isStripe}
        className={
          isStripe ? LABEL_CLASS : 'text-slate-700 dark:text-slate-200'
        }
      >
        {t('实付金额')}：
      </Text>
      {amountLoading ? (
        <Skeleton.Title style={{ width: '60px', height: '16px' }} />
      ) : (
        <div
          className={
            isStripe
              ? `${VALUE_COLUMN_CLASS} items-baseline gap-2`
              : 'flex items-baseline space-x-2'
          }
        >
          <Text
            strong
            className={isStripe ? 'text-[15px] font-semibold' : 'font-bold'}
            style={{ color: 'red' }}
          >
            {renderAmount()}
          </Text>
          {hasDiscount && (
            <Text size='small' className='text-rose-500'>
              {Math.round(discountRate * 100)}%
            </Text>
          )}
        </div>
      )}
    </div>
  );

  const paymentMethodRow = (
    <div className='flex justify-between items-center'>
      <Text
        strong={!isStripe}
        className={
          isStripe ? LABEL_CLASS : 'text-slate-700 dark:text-slate-200'
        }
      >
        {t('支付方式')}：
      </Text>
      {renderPaymentMethod()}
    </div>
  );

  return (
    <Modal
      title={
        <div className='flex items-center'>
          <CreditCard className='mr-2' size={18} />
          {t('充值确认')}
        </div>
      }
      visible={open}
      onOk={onlineTopUp}
      onCancel={handleCancel}
      maskClosable={false}
      centered
      confirmLoading={confirmLoading}
      size={isStripe ? undefined : 'small'}
      style={isStripe ? { width: 460 } : undefined}
    >
      <div className='space-y-4'>
        <Card className='!rounded-xl !border-0 bg-slate-50 dark:bg-slate-800'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <Text
                strong={!isStripe}
                className={
                  isStripe ? LABEL_CLASS : 'text-slate-700 dark:text-slate-200'
                }
              >
                {t('充值数量')}：
              </Text>
              <Text
                className={
                  isStripe
                    ? `${VALUE_COLUMN_CLASS} text-[14px] font-medium`
                    : 'text-slate-900 dark:text-slate-100'
                }
              >
                {trimZeroDecimal(renderQuotaWithAmount(topUpCount))}
              </Text>
            </div>
            {isStripe ? paymentMethodRow : amountRow}
            {isStripe ? amountRow : null}
            {hasDiscount && !amountLoading && (
              <>
                <div className='flex justify-between items-center'>
                  <Text className='text-slate-500 dark:text-slate-400'>
                    {t('原价')}：
                  </Text>
                  <Text delete className='text-slate-500 dark:text-slate-400'>
                    {`${originalAmount.toFixed(2)} ${t('元')}`}
                  </Text>
                </div>
                <div className='flex justify-between items-center'>
                  <Text className='text-slate-500 dark:text-slate-400'>
                    {t('优惠')}：
                  </Text>
                  <Text className='text-emerald-600 dark:text-emerald-400'>
                    {`- ${discountAmount.toFixed(2)} ${t('元')}`}
                  </Text>
                </div>
              </>
            )}
            {isStripe ? null : paymentMethodRow}
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default PaymentConfirmModal;
