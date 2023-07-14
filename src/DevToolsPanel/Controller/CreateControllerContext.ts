import React from 'react';

/**
 * Helper function to create a context and a hook that related to this context.
 * Should be used to inject controllers into components.
 */
export function createControllerContext<C>(): {
    useController: () => C;
    Provider: React.ProviderExoticComponent<React.ProviderProps<C | null>>;
} {
    const context = React.createContext<C | null>(null);

    const useController: () => C = () => {
        const api = React.useContext(context);
        if (api === null) {
            throw new Error(
                'Controller-Context not found. Did you forget to add the provider?',
            );
        }
        return api;
    };

    return {
        useController,
        Provider: context.Provider,
    };
}
