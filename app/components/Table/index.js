import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
  createRecord,
  updateRecord,
  deleteRecord,
} from 'containers/BizPage/actions';
import Sort from 'components/Sort';
import AddColumn from 'components/AddColumn';
import Check from 'components/Check';
import Modal from 'components/Modal';
import Dropdown from 'components/Dropdown';
import Wrapper from './Wrapper';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import Tr from './Tr';
import Th from './Th';
import Td from './Td';
import Tf from './Tf';
import Input from './Input';
import Static from './Static';
import ModalDialog from './ModalDialog';

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      header: props.header,
      body: props.body,
      modal: false,
      selectedItem: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      header: nextProps.header,
      body: nextProps.body,
    });
  }

  header = () =>
    this.state.header.map(element => (
      <Th align={element.align} key={element.name} width={element.width}>
        {element.name}
        <Sort value={element.sort} />
      </Th>
    ));

  format = (defaultValue, header) => {
    if (defaultValue === 0) {
      return this.props.currencyLabel + 0;
    }
    let value = defaultValue;
    if (header === 'salary' || header === 'total' || header === 'other') {
      const staticValue = Math.abs(value)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      value =
        value > 0
          ? `${this.props.currencyLabel}${staticValue}`
          : `-${this.props.currencyLabel}${staticValue}`;
    }
    return value;
  };

  body = () =>
    this.state.body.map(bodyElement => (
      <Tr paddingLeft={38} key={`tr${bodyElement.id}`} className="table__tr">
        {this.state.header.map(element => (
          <Td
            align={element.align}
            key={`td${element.name}${bodyElement.id}`}
            width={element.width}
          >
            {element.type === 'static' && (
              <Static align={element.align}>
                {this.format(
                  bodyElement.salary + bodyElement.other,
                  element.name,
                )}
              </Static>
            )}
            {(element.type === 'text' || element.type === 'date') && (
              <Input
                value={this.format(bodyElement[element.name], element.name)}
                type="text"
                align={element.align}
                onChange={value =>
                  this.changeValue(bodyElement.id, value, element.name)
                }
              />
            )}
            {element.type === 'image' && (
              <Check
                value={bodyElement[element.name]}
                onClick={() =>
                  this.changeValue(
                    bodyElement.id,
                    !bodyElement[element.name],
                    element.name,
                  )
                }
              />
            )}
            {element.type === 'action' && (
              <Dropdown
                value=""
                dropdownList={[
                  {
                    label: 'Duplicate',
                    func: () => this.props.onCreateRecord(bodyElement),
                  },
                  {
                    label: 'Delete',
                    func: () => this.showModal(bodyElement),
                  },
                ]}
              />
            )}
          </Td>
        ))}
      </Tr>
    ));

  footer = type => {
    if (type === 'name') {
      return 'Total';
    }
    if (type === 'salary' || type === 'other') {
      let value = 0;
      for (let i = 0; i < this.state.body.length; i += 1) {
        value += this.state.body[i][type];
      }
      return this.format(value, type);
    }
    if (type === 'total') {
      let value = 0;
      for (let i = 0; i < this.state.body.length; i += 1) {
        value += this.state.body[i].salary + this.state.body[i].other;
      }
      return this.format(value, type);
    }
    return '';
  };

  footerContent = () =>
    this.state.header.map(element => (
      <Tf align={element.align} key={element.name} width={element.width}>
        {this.footer(element.name)}
      </Tf>
    ));

  showModal = element => {
    this.setState({
      modal: true,
      selectedItem: element,
    });
  };

  closeModal = () => {
    this.setState({
      modal: false,
      selectedItem: null,
    });
  };

  changeValue = (id, value, name) => {
    const element = this.state.body.find(record => record.id === id);
    let updatedValue = value;
    if (name === 'salary' || name === 'other') {
      updatedValue = updatedValue.replace(this.props.currencyLabel, '');
      updatedValue = parseFloat(updatedValue.replace(',', ''));
    }
    element[name] = updatedValue;
    this.props.onUpdateRecord(element);
  };

  handleCreateRecord = element => {
    const record = Object.assign({}, element);
    record.category_id = this.props.categoryId;
    this.props.onCreateRecord(record);
  };

  deleteRecord = () => {
    this.props.onDeleteRecord(this.state.selectedItem.id);
    this.setState({
      modal: false,
      selectedItem: null,
    });
  };

  render() {
    return (
      <Wrapper>
        {this.state.modal && (
          <Modal onClose={this.closeModal}>
            <ModalDialog
              element={this.state.selectedItem}
              onDelete={this.deleteRecord}
              onClose={this.closeModal}
            />
          </Modal>
        )}
        <TableHeader>
          <Tr paddingLeft={50}>{this.header()}</Tr>
        </TableHeader>
        <TableBody>{this.body()}</TableBody>
        <AddColumn
          data={this.state.header}
          onCreate={this.handleCreateRecord}
        />
        <TableFooter>
          <Tr paddingLeft={50}>{this.footerContent()}</Tr>
        </TableFooter>
      </Wrapper>
    );
  }
}

Table.propTypes = {
  header: PropTypes.array,
  body: PropTypes.array,
  categoryId: PropTypes.number,
  currencyLabel: PropTypes.string,
  onCreateRecord: PropTypes.func,
  onUpdateRecord: PropTypes.func,
  onDeleteRecord: PropTypes.func,
};

export function mapDispatchToProps(dispatch) {
  return {
    onCreateRecord: record => dispatch(createRecord.request(record)),
    onUpdateRecord: record => dispatch(updateRecord.request(record)),
    onDeleteRecord: id => dispatch(deleteRecord.request(id)),
  };
}

const withConnect = connect(
  null,
  mapDispatchToProps,
);

export default compose(withConnect)(Table);
