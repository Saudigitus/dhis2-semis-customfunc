import React, { useEffect } from 'react'
import { useHeader } from '../hooks/table/useHeader'
import { useTableData } from '../hooks/table/useGetTableData'
import program from '../program.json'
import dataStore from '../dataStore.json'
import FileInput from '../fileInput/fileInput'

function MyApp() {

    return (
        <div>
            <FileInput />
        </div>
    )

}
export default MyApp
