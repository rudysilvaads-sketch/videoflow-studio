// Chrome Extension type declarations
declare namespace chrome {
  namespace runtime {
    function sendMessage(message: unknown, callback?: (response: unknown) => void): void;
    const onMessage: {
      addListener(callback: (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => boolean | void): void;
    };
  }
  
  namespace storage {
    const local: {
      get(keys: string[]): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  }
  
  namespace sidePanel {
    function open(options: { windowId: number }): Promise<void>;
    function setOptions(options: { tabId: number; path: string; enabled: boolean }): Promise<void>;
  }
  
  namespace tabs {
    function query(queryInfo: { active: boolean; currentWindow: boolean }, callback: (tabs: Array<{ id: number; url?: string; windowId: number }>) => void): void;
    function sendMessage(tabId: number, message: unknown): void;
    const onUpdated: {
      addListener(callback: (tabId: number, changeInfo: unknown, tab: { url?: string; windowId: number }) => void): void;
    };
  }
  
  namespace action {
    const onClicked: {
      addListener(callback: (tab: { id: number; windowId: number }) => void): void;
    };
  }
}
