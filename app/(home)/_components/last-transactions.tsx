import { Button } from "@/app/_components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";
import { formatCurrency } from "@/app/_utils/currency";
import { Transaction } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface LastTransactionsProps {
  lastTransactions: Transaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === "DEPOSIT") {
      return "text-green-500";
    }
    if (transaction.type === "EXPENSE") {
      return "text-red-500";
    }
    return "text-white";
  };

  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.type === "DEPOSIT") {
      return "+";
    } else {
      return "-";
    }
  };

  return (
    <ScrollArea className="rounded-md border">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-bold">Últimas Transações</CardTitle>
        <Button variant="outline" className="rounded-full font-bold" asChild>
          <Link href={"/transactions"}>Ver mais</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {lastTransactions.map((transaction) => (
          <div
            className="flex items-center justify-between"
            key={transaction.id}
          >
            <div className="item-center flex gap-3">
              <div className="rounded-lg bg-white bg-opacity-[3%] p-3">
                <Image
                  src={
                    TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]
                  }
                  alt="PIX"
                  width={20}
                  height={20}
                />
              </div>
              <div>
                <p className="text-sm font-bold">{transaction.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p className={`text-sm font-bold ${getAmountColor(transaction)}`}>
              {getAmountPrefix(transaction)}
              {formatCurrency(Number(transaction.amount))}
            </p>
          </div>
        ))}
        ;
      </CardContent>
    </ScrollArea>
  );
};

export default LastTransactions;
