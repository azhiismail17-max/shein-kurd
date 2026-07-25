import React from "react";
import type { Order } from "@/types";
import { getBoxName } from "@/lib/order-utils";
import { FastSkuSearch } from "./FastSkuSearch";

interface SkuSearchProps {
  orders: Order[];
  onFound: (order: Order) => void;
  boxOptions?: string[];
  initialBoxName?: string;
}

export const SkuSearch: React.FC<SkuSearchProps> = (props) => (
  <FastSkuSearch<Order> {...props} getOrderBoxName={getBoxName} />
);
