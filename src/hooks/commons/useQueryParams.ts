import { useSearchParams } from 'react-router-dom'
import React from 'react'

const useUrlParams = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const add = (key: string, value: string) => {
        const updatedSearchParams = new URLSearchParams(searchParams) // clone to avoid mutation bugs
        updatedSearchParams.set(key, value)
        setSearchParams(updatedSearchParams)
    }

    const remove = (key: string) => {
        const updatedSearchParams = new URLSearchParams(searchParams)
        updatedSearchParams.delete(key)
        setSearchParams(updatedSearchParams)
    }

    const query = React.useMemo(() => new URLSearchParams(searchParams), [searchParams])

    const urlParameters = React.useMemo(
        () => ({
            school: query.get('school'),
            schoolName: query.get('schoolName'),
            academicYear: query.get('academicYear'),
            sectionType: query.get('sectionType'),
            grade: query.get('grade'),
            class: query.get('class'),
            position: query.get('position'),
            employmentType: query.get('employmentType'),
            programStage: query.get('programStage'),
            attendanceMode: query.get('attendanceMode'),
            selectedDate: query.get('selectedDate')
        }), [query]
    )

    return { add, remove, useQuery: query, urlParameters }
}
export { useUrlParams }
