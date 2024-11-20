import React from 'react';
import { MoreVert } from '@material-ui/icons';
import { Center as Center } from '@dhis2/ui'
import { RowActionsProps } from '../../../../../types/table/TableRowActionsProps';
import { ListItemText, Menu, MenuItem, IconButton, ListItemIcon } from '@material-ui/core';


export default function MenuActions(props: RowActionsProps) {
  const { actions: menuItems, disabled } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Center>
        <IconButton
          id="basic-button"
          aria-haspopup="true"
          disabled={disabled}
          onClick={handleClick}
          aria-expanded={open ? 'true' : undefined}
          aria-controls={open ? 'basic-menu' : undefined}
          style={{ color: "#212121", opacity: disabled ? "0.5" : "1" }}
        >
          < MoreVert />
        </IconButton>
      </Center>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {menuItems?.map((item: any, index: any) => (
          <MenuItem dense
            key={index}
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              handleClose();
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
}
