export const AppState = Object.freeze({
    INTRO: 'intro',
    TOP_DOWN: 'topDown',
    FIRST_PERSON: 'firstPerson',
});


let currentState = AppState.INTRO;

const listeners = [];

export function getCurrentState() {
    return currentState;
}



export function switchState(newState) {
    if (!Object.values(AppState).includes(newState)) {
        console.warn(`Invalid state: ${newState}`);
        return;
    }

    if (newState === currentState) return;

    listeners.forEach((cb) => cb(newState, currentState)); //callback to notify listeners of state change

    currentState = newState;
}

export function onStateChange(callback) {
    listeners.push(callback);
}