// Simple in-memory store for passing selected address back from locationPicker
// without re-mounting the calling screen.

let _selectedAddress = null;
let _listeners = [];

export const locationStore = {
    setAddress(address) {
        _selectedAddress = address;
        _listeners.forEach(fn => fn(address));
    },

    getAddress() {
        return _selectedAddress;
    },

    /** Consume the address (read + clear) */
    consumeAddress() {
        const addr = _selectedAddress;
        _selectedAddress = null;
        return addr;
    },

    subscribe(listener) {
        _listeners.push(listener);
        return () => {
            _listeners = _listeners.filter(fn => fn !== listener);
        };
    },
};
