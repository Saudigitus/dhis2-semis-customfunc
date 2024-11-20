import style from './tableRowActions.module.css'
import IconActions from './components/IconActions';
import MenuActions from './components/MenuActions';
import { CircularLoader, Center as Center } from '@dhis2/ui'
import { TableRowActionsProps } from '../../../../types/table/TableRowActionsProps';


export default function TableRowActions(props: TableRowActionsProps) {
  const { displayType = "icon", actions, loading, disabled } = props;

  const renderMenu = (type: "icon" | "menu") => {
    switch (type) {
      case "menu":
        return <MenuActions disabled={disabled} actions={actions} />

      case "icon":
      default:
        return <IconActions disabled={disabled} actions={actions} />
    }
  }

  if (loading) {
    return (
      <Center>
        <CircularLoader small />
      </Center>
    )
  }

  return (
    <div className={style.rowActionsContainer}>{renderMenu(displayType)}</div>
  )
}