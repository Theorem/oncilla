# 6.0.0

- Remove SemiControlledInput, consider instead: https://github.com/Theorem/react-tools/blob/master/docs/reference.md#useinputwithdraftstate

# 5.5.0

- Support IE11 syntactically

# 5.4.3

- Maintenance release

# 5.4.2

- Maintenance release

# 5.4.1

- Fix reconnects not being smooth after the first one

# 5.4.0

- Patch form of useData
- Remove initial connection delay
- useMultipleData
- Throttle offline indicator a little bit
- Fix useData not handling parameter changing correctly

# 5.3.1

- Allow unexpected auth messages
- Fix sending updates to clients

# 5.3.0

- Add context to serialization APIs

# 5.2.0

- Refresh auth periodically

# 5.1.0

- Facilities to create items, useCreate hook

# 5.0.0

- Breaking: pushResult sends inline update
- New clientError message
- WebSocket client:
  - Send pings periodically and force reconnect if needed
  - Resend state messages on reconnect (subscribe, auth)
- Queue messages behind auth
- Subscribe message is idempotent in the WebSocket server

# 4.1.0

- Pre-auth message queue on the server.

# 4.0.0

- Support auth message in websocket client

# 3.1.0

- close helper in parseToken.

# 3.0.0

- Breaking: WebSocket server renames onAuthenticate into auth key.
- Ability to forbid clients from reading or writing some items.

# 2.4.0

- Close function in onAuthenticate.

# 2.3.0

- Auth additions to WebSocket protocol.
- Close connection function in the server-side piece.

# 2.2.0

- Client-side sync throttle.

# 2.1.0

- Add custom Websocket server helper
- Added custom serialization

# 2.0.0

- Split the core and the adapters for easier tree-shaking and clearer structure.
- WebSocket in-memory server on the backend.

# 1.1.0

- Add onMissing option to a dummy network adapter
