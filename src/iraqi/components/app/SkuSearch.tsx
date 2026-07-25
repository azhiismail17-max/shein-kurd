import React from "react";
import type { Order } from "@/iraqi/types";
import { getBoxName } from "@/iraqi/lib/order-utils";
import { FastSkuSearch } from "@/components/app/FastSkuSearch";

interface SkuSearchProps {
  orders: Order[];
  onFound: (order: Order) => void;
  boxOptions?: string[];
  initialBoxName?: string;
}

export const SkuSearch: React.FC<SkuSearchProps> = (props) => (
  <FastSkuSearch<Order> {...props} getOrderBoxName={getBoxName} />
);
