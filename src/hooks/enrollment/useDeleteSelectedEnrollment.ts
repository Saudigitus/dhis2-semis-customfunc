import { useDeleteTEI } from "../tei/useDeleteTei";
import { useDeleteEnrollment } from "./useDeleteEnrollments";
import { useGetTotalEnrollments } from "./useGetTotalEnrollments";


function useDeleteSelectedEnrollment() {
    const { deleteTEI } = useDeleteTEI()
    const { deleteEnrollment } = useDeleteEnrollment()
    const { getTotalEnrollment } = useGetTotalEnrollments()

    const deleteSelectedEnrollment = async (initialValues: any) => {
        const promises = [];
        
        promises.push(deleteEnrollment(initialValues.enrollment))

        await getTotalEnrollment(initialValues.trackedEntity)
            .then((resp: any) => {
                if (resp?.results?.enrollments?.length <= 1) {
                    promises.push(deleteTEI(initialValues.trackedEntity))
                }
            })

        return await Promise.all(promises)
           
    }


    return { deleteSelectedEnrollment }
}

export {useDeleteSelectedEnrollment}