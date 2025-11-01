declare module 'sockjs-client' {
  interface SockJS {
    close(): void;
    send(data: string): void;
    onopen?: (event: Event) => void;
    onclose?: (event: CloseEvent) => void;
    onmessage?: (event: MessageEvent) => void;
    onerror?: (event: Event) => void;
  }
  
  interface SockJSConstructor {
    new (url: string): SockJS;
  }
  
  const SockJS: SockJSConstructor;
  export = SockJS;
}

declare module 'stompjs' {
  interface Client {
    connect(headers: any, connectCallback: () => void, errorCallback?: (error: any) => void): void;
    disconnect(disconnectCallback?: () => void): void;
    subscribe(destination: string, callback: (message: any) => void): any;
    send(destination: string, headers?: any, body?: string): void;
    debug?: (message: string) => void;
  }
  
  interface StompStatic {
    over(socket: any): Client;
  }
  
  const Stomp: StompStatic;
  export = Stomp;
}
