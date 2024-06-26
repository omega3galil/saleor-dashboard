import { IMessage } from "@dashboard/components/messages";
import {
  OrderDetailsGrantRefundQuery,
  OrderGrantRefundAddMutation,
  OrderGrantRefundCreateErrorCode,
  OrderGrantRefundCreateErrorFragment,
  OrderGrantRefundCreateLineInput,
} from "@dashboard/graphql";
import { UseNavigatorResult } from "@dashboard/hooks/useNavigator";
import {
  LineToRefund,
  OrderTransactionRefundError,
} from "@dashboard/orders/components/OrderTransactionRefundPage/OrderTransactionRefundPage";
import { orderTransactionRefundEditUrl } from "@dashboard/orders/urls";
import { IntlShape } from "react-intl";

import { transactionRefundEditMessages } from "../OrderTransactionRefundEdit/messages";

export const handleRefundCreateComplete = ({
  submitData,
  notify,
  setLinesErrors,
  navigate,
  intl,
  orderId,
}: {
  submitData: OrderGrantRefundAddMutation;
  notify: (message: IMessage) => void;
  setLinesErrors: (value: React.SetStateAction<OrderTransactionRefundError[]>) => void;
  navigate: UseNavigatorResult;
  intl: IntlShape;
  orderId: string;
}) => {
  const errors = submitData.orderGrantRefundCreate?.errors ?? [];
  const errorLines: OrderTransactionRefundError[] = [];

  if (errors.length === 0) {
    notify({
      status: "success",
      text: intl.formatMessage(transactionRefundEditMessages.savedDraft),
    });
    navigate(
      orderTransactionRefundEditUrl(
        orderId,
        submitData.orderGrantRefundCreate?.grantedRefund?.id ?? "",
      ),
    );

    return;
  }

  if (errors.length > 0) {
    errors.forEach((err: OrderGrantRefundCreateErrorFragment) => {
      if (
        ![
          OrderGrantRefundCreateErrorCode.REQUIRED,
          OrderGrantRefundCreateErrorCode.AMOUNT_GREATER_THAN_AVAILABLE,
        ].includes(err.code)
      ) {
        notify({
          status: "error",
          text: err.message,
        });
      }

      errorLines.push({
        code: err.code,
        field: err.field,
        lines: err.lines,
        message: err.message,
      } as OrderTransactionRefundError);

      setLinesErrors(errorLines);
    });
  }
};

export const prepareRefundAddLines = ({
  linesToRefund,
  data,
}: {
  linesToRefund: LineToRefund[];
  data: OrderDetailsGrantRefundQuery;
}): OrderGrantRefundCreateLineInput[] => {
  return linesToRefund.reduce<OrderGrantRefundCreateLineInput[]>((acc, line, ix) => {
    if (typeof line.quantity === "number" && line.quantity > 0) {
      acc.push({
        quantity: line.quantity,
        reason: line.reason,
        id: data.order!.lines[ix].id,
      });
    }

    return acc;
  }, []);
};

export const checkAmountExceedsChargedAmount = ({
  order,
  transactionId,
  amount,
}: {
  order: OrderDetailsGrantRefundQuery["order"];
  transactionId: string | undefined;
  amount: number | undefined;
}): boolean => {
  if (!transactionId || !amount || !order) {
    return false;
  }

  const selectedTransaction = order.transactions.find(
    transaction => transaction.id === transactionId,
  );

  if (!selectedTransaction) {
    return false;
  }

  return amount > selectedTransaction?.chargedAmount.amount;
};

export const handleAmountExceedsChargedAmount = ({
  setLinesErrors,
  intl,
}: {
  setLinesErrors: (value: React.SetStateAction<OrderTransactionRefundError[]>) => void;
  intl: IntlShape;
}) => {
  setLinesErrors([
    {
      field: "amount",
      message: intl.formatMessage(transactionRefundEditMessages.amountExceedsChargedAmount),
      code: "AMOUNT_GREATER_THAN_AVAILABLE",
      lines: [],
    },
  ]);
};
