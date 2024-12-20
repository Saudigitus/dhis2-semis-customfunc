var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from 'react';
const EVENT_QUERY = (queryProps) => ({
    results: {
        resource: "tracker/events",
        params: Object.assign({}, queryProps)
    }
});
export function useGetEvents() {
    const engine = useDataEngine();
    const [error, setError] = useState(null);
    function getEvents(props) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield engine.query(EVENT_QUERY(Object.assign({}, props))).then((resp) => {
                var _a;
                return (_a = resp.results) === null || _a === void 0 ? void 0 : _a.instances;
            }).catch((resp) => {
                setError(resp);
            });
        });
    }
    return { getEvents, error };
}
