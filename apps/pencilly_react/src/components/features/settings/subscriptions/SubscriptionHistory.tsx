import { useGetSubscriptionHistory } from "@/components/features/settings/subscriptions/useGetSubscriptionHistory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCheckScrollEnd } from "@/hooks/useCheckScrollEnd";
import { timePassedSince } from "@/lib/date-transform";
import { cn, isEmpty } from "@/lib/utils";
import { useTranslations } from "@/i18n";

const statusesColors = {
  active: "bg-success-lighter text-success-dark",
  expired: "bg-warning-lighter text-warning-dark",
  failed: "bg-danger-lighter text-danger-dark",
} as const;

/**
 * user transactions component used in the User Panel
 * open in upgrade panel by click on transaction history button
 * @constructor
 */
function SubscriptionHistory() {
  const t = useTranslations("settings");
  const {
    data: subscriptionHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetSubscriptionHistory();

  const { containerRef, loadingTargetRef } = useCheckScrollEnd(() => {
    if (hasNextPage) {
      void fetchNextPage();
    }
  }, !isEmpty(subscriptionHistory));

  return (
    <Table
      className="font-normal"
      wrapperProps={{
        className: "border rounded flex-1  overflow-y-auto",
        ref: containerRef,
        children: (
          <div
            ref={loadingTargetRef}
            className={cn(
              "text-sm text-center w-full text-foreground",
              (!isFetchingNextPage || isEmpty(subscriptionHistory)) &&
                "opacity-0 h-0.5 -mt-2",
            )}
          >
            {t("loading")}...
          </div>
        ),
      }}
    >
      <TableHeader>
        <TableRow>
          <TableHead>{t("plane_t_head")}</TableHead>
          <TableHead>{t("date_t_head")}</TableHead>
          <TableHead>{t("price_t_head")}</TableHead>
          <TableHead>{t("status_t_head")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptionHistory?.map(item => (
          <TableRow key={item.id} className="[&>td]:py-2">
            <TableCell className="capitalize">
              {item.price_plan_id?.replaceAll("-", " ").replaceAll("_", " ")}
            </TableCell>
            <TableCell>{timePassedSince(item.created_at)}</TableCell>
            <TableCell>{item.amount}</TableCell>
            <TableCell>
              <div
                className={cn(
                  "w-full text-center rounded px-4 py-2 max-w-32",
                  statusesColors[
                    item.status.toLocaleLowerCase() as
                      | "active"
                      | "expired"
                      | "failed"
                  ],
                )}
              >
                {item.status}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default SubscriptionHistory;
