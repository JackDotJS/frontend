import { JSX, Match, Switch, createEffect, onCleanup, onMount } from "solid-js";

import { Server } from "revolt.js";

import { ChannelContextMenu, ServerContextMenu } from "@revolt/app";
import { clientController } from "@revolt/client";
import { State, TransitionType } from "@revolt/client/Controller";
import { KeybindAction } from "@revolt/keybinds";
import { modalController } from "@revolt/modal";
import { Navigate, useBeforeLeave } from "@revolt/routing";
import { state } from "@revolt/state";
import { Preloader } from "@revolt/ui";
import { useKeybindActions } from "@revolt/ui/components/context/Keybinds";
import { styled } from "styled-system/jsx";

import { Sidebar } from "./interface/Sidebar";

/**
 * Application layout
 */
const Interface = (props: { children: JSX.Element }) => {
  const keybinds = useKeybindActions();

  useBeforeLeave((e) => {
    if (!e.defaultPrevented) {
      if (e.to === "/settings") {
        e.preventDefault();
        modalController.push({
          type: "settings",
          config: "user",
        });
      } else if (typeof e.to === "string") {
        state.layout.setLastActivePath(e.to);
      }
    }
  });

  onMount(() => {
    keybinds.addEventListener(
      KeybindAction.DeveloperToggleAllExperiments,
      state.experiments.toggleSafeMode
    );
  });

  onCleanup(() => {
    keybinds.removeEventListener(
      KeybindAction.DeveloperToggleAllExperiments,
      state.experiments.toggleSafeMode
    );
  });

  createEffect(() => {
    if (!clientController.isLoggedIn()) {
      console.info("WAITING... currently", clientController.lifecycle.state());
    }
  });

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100%",
      }}
    >
      <Notice>
        ⚠️ This is beta software, things will break! State:{" "}
        <Switch>
          <Match when={clientController.lifecycle.state() === State.Connecting}>
            Connecting
          </Match>
          <Match when={clientController.lifecycle.state() === State.Connected}>
            Connected
          </Match>
          <Match
            when={clientController.lifecycle.state() === State.Disconnected}
          >
            Disconnected{" "}
            <a
              onClick={() =>
                clientController.lifecycle.transition({
                  type: TransitionType.Retry,
                })
              }
            >
              (reconnect now)
            </a>
          </Match>
          <Match
            when={clientController.lifecycle.state() === State.Reconnecting}
          >
            Reconnecting
          </Match>
          <Match when={clientController.lifecycle.state() === State.Offline}>
            Device is offline
          </Match>
        </Switch>
      </Notice>
      <Switch fallback={<Preloader grow type="spinner" />}>
        <Match when={!clientController.isLoggedIn()}>
          <Navigate href="/login" />
        </Match>
        <Match when={clientController.lifecycle.loadedOnce()}>
          <Layout
            style={{ "flex-grow": 1, "min-height": 0 }}
            onDragOver={(e) => {
              if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
            }}
            onDrop={(e) => e.preventDefault()}
          >
            <Sidebar
              menuGenerator={(target) => ({
                contextMenu: () => {
                  return (
                    <>
                      {target instanceof Server ? (
                        <ServerContextMenu server={target} />
                      ) : (
                        <ChannelContextMenu channel={target} />
                      )}
                    </>
                  );
                },
              })}
            />
            <div
              style={{
                background: "var(--colours-messaging-message-box-background)",
                display: "flex",
                width: "100%",
                "min-width": 0,
              }}
            >
              {props.children}
            </div>
          </Layout>
        </Match>
      </Switch>
    </div>
  );
};

const Notice = styled("div", {
  base: {
    textAlign: "center",
    fontSize: "0.8em",
    // margin: "var(--gap-md) var(--gap-md) 0 var(--gap-md)",
    padding: "var(--gap-md)",
    background: "var(--colours-testing)",
    color: "var(--colours-messaging-message-box-foreground)",
    // borderRadius: "var(--borderRadius-md)",
  },
});

/**
 * Parent container
 */
const Layout = styled("div", {
  base: {
    display: "flex",
    height: "100%",
    background: "var(--colours-testing)",
    minWidth: 0,
  },
});

export default Interface;
