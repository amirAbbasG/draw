import {useMutation} from "@tanstack/react-query";

import {useAxiosFetcher} from "@/hooks/useAxiosFetch";
import {envs} from "@/constants/envs";


interface PayBody {
    price_plan_id: string
    next_url?: string
}

export interface PayResponse {
    purchase_history: PurchaseHistory
    stripe_checkout: StripeCheckout
}

export interface PurchaseHistory {
    id: number
    status: string
    price_plan_id: string
    amount: number
    processing_site: string
    user_profile_id: number
    created_at: string
    updated_at: string
}

export interface StripeCheckout {
    session_id: string
    url: string
    mode: string
}

export function usePainPlan() {
    const {axiosFetch} = useAxiosFetcher();
    const {mutate: mutatePay, isPending} = useMutation({
        mutationFn: ({next_url, price_plan_id}:  PayBody) =>
            axiosFetch<PayResponse>(
                {
                    url: "/billing/purchase_initiate/",
                    showError: true,
                    method: "post",
                },
                {
                    price_plan_id,
                    next_url: next_url || envs.siteUrl
                },
            ),
        onSuccess(data) {
            if (data?.stripe_checkout?.url) {
                window.location.href = data.stripe_checkout.url;
            }
        }
    });
    return {mutatePay, isPending};
}

