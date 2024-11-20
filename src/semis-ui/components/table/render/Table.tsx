import React, { useState } from 'react'
import { Center as Center, CircularLoader } from "@dhis2/ui";
import RenderHeader from './RenderHeader'
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import WithBorder from '../../template/WithBorder';
import WithPadding from '../../template/WithPadding';
import TableComponent from '../components/table/TableComponent';
import Pagination from '../components/pagination/Pagination';
import RenderRows from './RenderRows';
import { TableRenderProps } from '../../../types/table/TableContentProps';
import HeaderFilters from '../components/head/HeaderFilters';
import { CustomAttributeProps } from '../../../types/variables/AttributeColumns';

const usetStyles = makeStyles((theme) => ({
    tableContainer: {
        overflowX: 'auto'
    },
    workingListsContainer: {
        display: 'flex',
        marginLeft: '0.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    h4: {
        margin: '10px 0px 10px 5px',
        fontSize: '22px',
        fontWeigth: '500',
        [theme.breakpoints.down('md')]: {
            fontSize: '20px',
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '16px',
        }
    }
}));

function Table(props: TableRenderProps): React.ReactElement {
    const { viewPortWidth,
        columns, totalElements,
        loading, createSortHandler,
        order, orderBy, rowsPerPages,
        tableData,
        isInactive,
        isOwnershipOu,
        showEnrollments,
        sortable,
        searchActions,
        showRowActions,
        rowAction,
        displayType,
        filterState,
        setFilterState,
        defaultFilterNumber
    } = props

    const classes = usetStyles()
    const [page, setpage] = useState(1)
    const [pageSize, setpageSize] = useState(10)
    const [filteredHeaders, setfilteredHeaders] = useState<CustomAttributeProps[]>([])

    const onPageChange = (newPage: number) => {
        setpage(newPage)
    }

    const onRowsPerPageChange = (event: any) => {
        setpageSize(parseInt(event.value, 10))
        setpage(1)
    }

    return (
        <Paper>
            <div className={classes.workingListsContainer}>
                <h4 className={classes.h4}>Enrollments</h4>
                <div />
            </div>
            <WithBorder type='bottom' />
            <WithPadding>
                <WithBorder type='all'>
                    <HeaderFilters
                        columns={columns}
                        updateVariables={setfilteredHeaders}
                        filteredHeaders={filteredHeaders}
                        filterState={filterState}
                        setFilterState={setFilterState}
                        defaultFilterNumber={defaultFilterNumber}
                    />
                    <div
                        className={classes.tableContainer}
                    >
                        <TableComponent>
                            <>
                                {
                                    viewPortWidth > 520 &&
                                    <RenderHeader
                                        createSortHandler={createSortHandler}
                                        order={order}
                                        orderBy={orderBy}
                                        rowsHeader={filteredHeaders.length > 0 ? filteredHeaders : columns}
                                        sortable={sortable}
                                        showRowActions={showRowActions}
                                    />
                                }
                                {!loading && (
                                    <RenderRows
                                        headerData={filteredHeaders.length > 0 ? filteredHeaders : columns}
                                        rowsData={tableData}
                                        loading={loading}
                                        isInactive={isInactive}
                                        isOwnershipOu={isOwnershipOu}
                                        showEnrollments={showEnrollments}
                                        searchActions={searchActions}
                                        viewPortWidth={viewPortWidth}
                                        showRowActions={showRowActions}
                                        rowAction={rowAction}
                                        displayType={displayType}
                                    />
                                )}

                            </>
                        </TableComponent>
                        {(loading) ? (
                            <Center className="p-5">
                                <CircularLoader />
                            </Center>
                        ) : null}
                    </div>
                    <Pagination
                        loading={loading}
                        onPageChange={onPageChange}
                        onRowsPerPageChange={onRowsPerPageChange}
                        page={page}
                        rowsPerPage={pageSize}
                        totalPerPage={totalElements}
                        disablePreviousPage={page === 1}
                        disableNextPage={page * pageSize >= totalElements}
                        rowsPerPages={rowsPerPages}
                    />
                </WithBorder>
            </WithPadding>
        </Paper>
    )
}

export default Table
