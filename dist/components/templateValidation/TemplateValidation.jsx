var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DropZone } from 'dhis2-semis-components';
import React from 'react';
import { useValidation } from '../../hooks/template_validation/useValidation';
import { modules } from '../../types/commons/moduleTypes';
function TemplateValidation() {
    const UseValidation = new useValidation();
    const onValidation = (file) => __awaiter(this, void 0, void 0, function* () {
        UseValidation.setModule(modules.performance);
        console.log(yield UseValidation.validation(file[0]));
    });
    return (<DropZone accept='' onSave={(file) => onValidation(file)}/>);
}
export default TemplateValidation;
