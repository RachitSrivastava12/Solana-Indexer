/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      isConnected: boolean;
      publicKey: {
        toString: () => string;
      };
      connect: () => Promise<{ publicKey: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: any) => void;
      off: (event: string, callback?: any) => void;
    };
  };
}