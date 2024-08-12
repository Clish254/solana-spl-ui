"use client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";

// Check: https://github.com/solana-labs/wallet-adapter/issues/648
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);
export default function NavBar() {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex">
        <Link href="/" className="flex items-center mr-4" prefetch={false}>
          <span className="text-lg font-semibold">SPL UI</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tokens</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem href="/" title="Create">
                    Create a new token by creating a mint account.
                  </ListItem>
                  <ListItem href="/mint" title="Mint">
                    Increase the supply and transfer the new tokens to a
                    specific token account.
                  </ListItem>
                  <ListItem href="/transfer" title="Transfer">
                    Transfer tokens from one token account to another token
                    account.
                  </ListItem>
                  <ListItem href="/burn" title="Burn">
                    You can burn token if you are the token owner.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Accounts</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <ListItem href="/account/create" title="Create token account">
                    Create a new token account.
                  </ListItem>
                  <ListItem
                    href="/account/delegate"
                    title="Delegate token account"
                  >
                    You can set a delegate with an allowed amount.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div>
        <WalletMultiButtonDynamic style={{}} />
      </div>
    </div>
  );
}
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  if (!href) {
    throw new Error("`href` is required for the ListItem component.");
  }
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
