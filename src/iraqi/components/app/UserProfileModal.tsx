import React, { useState, useEffect } from "react";
import { X, User, MessageCircle, Activity, Package, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/iraqi/types";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserStatsForProfile, parseOrderPrice, SOURCE_STYLES } from "@/lib/combinedProfile";

interface UserProfileModalProps {
  userTarget: { username: string; role: string };
  onClose: () => void;
  onMessage: () => void;
  allOrders: Order[];
  canDelete?: boolean;
  canViewOrders?: boolean;
  profileMode?: "all" | "kurdistani" | "iraqi";
  viewingMonth?: string;
  onOrderClick?: (order: Order) => void;
}

export default function UserProfileModal({
  userTarget,
  onClose,
  onMessage,
  allOrders,
  canDelete,
  canViewOrders = true,
  profileMode = "iraqi",
  viewingMonth = "",
  onOrderClick,
}: UserProfileModalProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalValue: 0,
    isActiveToday: false,
    isOnline: false,
    recentOrders: [] as ReturnType<typeof getUserStatsForProfile>["recentOrders"],
    bySource: [] as ReturnType<typeof getUserStatsForProfile>["bySource"],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: any = () => {};
    try {
      unsubscribe = onSnapshot(
        collection(db, "user_stats"),
        (snapshot) => {
          const rawStats: Record<string, any> = {};
          snapshot.forEach((docSnap) => {
            rawStats[docSnap.id] = docSnap.data();
          });
          setStats(getUserStatsForProfile(rawStats, userTarget.username, profileMode));
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        },
      );
    } catch (err) {
      setLoading(false);
    }
    return () => unsubscribe();
  }, [userTarget.username, profileMode]);

  const { isActiveToday, isOnline, bySource } = stats;
  const recentOrders = canViewOrders
    ? stats.recentOrders.filter(
        (order) =>
          order.sheet === viewingMonth &&
          allOrders.some((o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet),
      )
    : [];
  const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" });
  const totalOrders = recentOrders.length;
  const todayOrders = recentOrders.filter(
    (order) =>
      order.createdAt &&
      new Date(order.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Baghdad" }) ===
        todayKey,
  ).length;
  const totalValue = recentOrders.reduce((sum, order) => sum + parseOrderPrice(order.price), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card shadow-xl sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 items-center justify-between bg-gradient-to-r from-primary/80 to-primary px-4 sm:h-24">
          <div />
          <button
            onClick={onClose}
            className="p-1.5 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20 rounded-full transition-colors self-start mt-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="absolute -top-8 left-4 h-16 w-16 rounded-full bg-background p-1.5 sm:-top-10 sm:left-6 sm:h-20 sm:w-20">
            <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <User className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
            </div>
          </div>

          <div className="pt-10 sm:pt-12">
            <h3 className="flex min-w-0 flex-wrap items-center gap-2 text-lg font-bold sm:text-xl">
              {userTarget.username}
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold tracking-wider">
                {userTarget.role}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 dark:text-green-500 font-medium">Online Now</span>
                </>
              ) : isActiveToday ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-blue-600 dark:text-blue-500 font-medium">Active Today</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span>Inactive Today</span>
                </>
              )}
            </p>
          </div>

          {canViewOrders && (
            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              <div className="rounded-xl border border-border/50 bg-muted/50 p-2.5 sm:p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <Package className="h-4 w-4" /> {viewingMonth} Orders
                </div>
                <div className="text-xl font-bold sm:text-2xl">{totalOrders}</div>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/50 p-2.5 sm:p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <Activity className="h-4 w-4" /> Today
                </div>
                <div className="text-xl font-bold sm:text-2xl">{todayOrders}</div>
              </div>

              <div className="col-span-2 rounded-xl border border-border/50 bg-muted/50 p-2.5 sm:p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <Banknote className="h-4 w-4" />{" "}
                  {profileMode === "all" ? "Combined Value" : "Total Value"}
                </div>
                <div className="text-xl font-bold sm:text-2xl">
                  {totalValue.toLocaleString()} IQD
                </div>
              </div>
            </div>
          )}

          {canViewOrders && profileMode === "all" && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {bySource.map((entry) => (
                <div
                  key={entry.source}
                  className={`rounded-xl border p-3 ${SOURCE_STYLES[entry.source].badge}`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${SOURCE_STYLES[entry.source].dot}`}
                    />
                    {SOURCE_STYLES[entry.source].label}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{entry.totalOrders} orders</div>
                </div>
              ))}
            </div>
          )}

          {canViewOrders && (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />{" "}
                  {profileMode === "all" ? "Combined Orders" : "Orders"}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {recentOrders.length} tracked in {viewingMonth}
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-sm text-muted-foreground py-4">Loading profile...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">
                    No tracked orders in {viewingMonth}.
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <button
                      key={`${order.source}-${order.sheet}-${order.id}-${order.createdAt}`}
                      type="button"
                      onClick={() => {
                        const match = allOrders.find(
                          (o) => String(o.id) === String(order.id) && o.sheet_name === order.sheet,
                        );
                        if (match) {
                          onClose();
                          onOrderClick?.(match);
                        }
                      }}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-accent ${profileMode === "all" ? `border-l-4 ${SOURCE_STYLES[order.source].row}` : "bg-card"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">@{order.insta}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            #{order.id} &middot; {order.sheet}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold">
                            {parseOrderPrice(order.price).toLocaleString()} IQD
                          </div>
                          {profileMode === "all" && (
                            <div
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SOURCE_STYLES[order.source].badge}`}
                            >
                              {SOURCE_STYLES[order.source].label}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            <Button className="flex-1 rounded-xl" onClick={onMessage}>
              <MessageCircle className="h-4 w-4 mr-2" /> Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
