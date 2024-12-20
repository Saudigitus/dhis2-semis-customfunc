var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useDataMutation } from "@dhis2/app-runtime";
const postEvent = {
    resource: 'tracker',
    type: 'create',
    data: ({ data }) => data,
    params: ({ params }) => params
};
const useUploadEvents = () => {
    const params = {
        async: false,
        atomicMode: "OBJECT",
        reportMode: "FULL"
    };
    const [mutate,] = useDataMutation(postEvent);
    function uploadValues(postData, importMode, importStrategy) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mutate({ data: postData, params: Object.assign(Object.assign({}, params), { importStrategy, importMode }) });
        });
    }
    return { uploadValues };
};
export default useUploadEvents;
