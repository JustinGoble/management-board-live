import React from 'react';
import _ from 'lodash';
import {
  Alert, Tree, Button, Table,
  Layout, Empty, InputNumber,
  Tooltip, Input, Modal, Radio,
} from 'antd';
import {
  RightOutlined,
  UndoOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import TopBar from './TopBar';
import * as request from '../utils/request';
import '../../css/containers/RequestNew.less';

const { Search, TextArea } = Input;
const { Sider, Content, Footer } = Layout;
const { confirm } = Modal;
class RequestNew extends React.Component {
  state = {
    expandedKeys: [],
    selectedKey: null,
    requestedItems: [],
    details: '',
    searchValue: '',
    createButtonEnabled: false,
    addButtonTooltip: 'Select an item first',
    sourceItemHierarchy: [],
    fullItemList: [],
    searchItemList: null,
    loadingItemList: false,
    pagination: {
      pageSize: 10,
      current: 1,
    },
    saving: false,
    error: null,
    requestTypeValue: null,
  };

  buildItemList(elementList, tag = null, list = []) {
    for (const element of elementList) {
      if (element.data) {
        this.buildItemList(element.data, element.tag || tag, list);
      } else {
        list.push({
          ...element,
          tag,
        });
      }
    }
    return list;
  }

  /**
   * Applies keys to the various hieararchy items so that they
   * don't get mixed up with items of different types
   * (crafting items vs ships) which can have same IDs.
   */
  applyKeys(hierarchy, categoryKey, itemKey) {
    for (const element of hierarchy) {
      if (element.data) {
        element.key = `${categoryKey}${element.id}`;
        this.applyKeys(element.data, categoryKey, itemKey);
      } else {
        element.key = `${itemKey}${element.id}`;
      }
    }
  }

  async componentDidMount() {
    this.setState({
      loadingItemList: true,
    });
    try {
      const sourceItemHierarchy = await request.get({
        path: `/api/v1/crafting-items/export`,
      });
      this.applyKeys(sourceItemHierarchy, 'ci', 'i');

      const shipList = await request.get({
        path: `/api/v1/ships/list`,
      });
      const shipCategoryList = await request.get({
        path: `/api/v1/ship-categories/list`,
      });

      const shipHierarchyRoot = {
        id: 0,
        name: "Ships",
        tag: "ship",
        data: _.map(shipCategoryList, c => ({
          ...c,
          data: _.filter(shipList, s => s.categoryId === c.id),
        })),
      };
      this.applyKeys([shipHierarchyRoot], 'cs', 's');

      sourceItemHierarchy.push(shipHierarchyRoot);

      const fullItemList = this.buildItemList(sourceItemHierarchy);

      this.setState({
        fullItemList,
        sourceItemHierarchy,
        loadingItemsList: false,
      });
    } catch (e) {
      this.setState({
        error: e.message,
        loadingItemList: false,
      });
    }
  }

  componentDidUpdate() {
    const {
      requestedItems,
      fullItemList,
      selectedKey,
      details,
    } = this.state;

    const createButtonEnabled =
      requestedItems.length > 0
      && details.length > 0
      && !this.state.saving
      && this.state.requestTypeValue;

    if (this.state.createButtonEnabled !== createButtonEnabled) {
      this.setState({
        createButtonEnabled,
      });
    }

    let addButtonTooltip = 'Select an item first';

    const selectedItem = _.find(fullItemList, { key: selectedKey });
    if (selectedItem) {
      addButtonTooltip = '';

      if (_.find(requestedItems, { key: selectedKey })) {
        addButtonTooltip = 'Item already added';
      }
    }

    if (this.state.addButtonTooltip !== addButtonTooltip) {
      this.setState({
        addButtonTooltip,
      });
    }
  }

  mapHierarchyData(el) {
    if (!el.data) {
      return {
        title: <span className='element'>{el.name}</span>,
        key: el.key,
      };
    }

    const children = _.map(
      el.data,
      i => this.mapHierarchyData(i),
    );

    return {
      title: el.name,
      key: el.key,
      children,
    };
  }

  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
    });
  }

  onSelect(selectedKeys) {
    const expand = selectedKeys.length ? selectedKeys : this.state.expandedKeys;
    this.setState({
      expandedKeys: expand,
    });

    if (selectedKeys[0]) {
      this.setState({
        selectedKey: selectedKeys[0],
      });
    }
  }

  addRequestedElement() {
    const {
      fullItemList,
      selectedKey,
    } = this.state;

    const requestedItems = [...this.state.requestedItems];
    const item = _.find(fullItemList, { key: selectedKey });
    const element = {
      ...item,
      quantity: 1,
    };
    requestedItems.push(element);
    this.setState({
      requestedItems,
    });
  }

  changeQuantity(quantity, itemKey) {
    const requestedItems = [...this.state.requestedItems];
    const item = _.find(requestedItems, el => el.key === itemKey);
    if (item) {
      item.quantity = quantity;
      this.setState({
        requestedItems,
      });
    }
  }

  deleteItem(itemKey) {
    const newlist = [...this.state.requestedItems];
    if (_.remove(newlist, el => el.key === itemKey).length > 0) {
      this.setState({
        requestedItems: newlist,
      });
    }
  }

  onSearch(event) {
    const { value } = event.target;

    if (value.length > 1) {
      const found = [];
      const reg = `\\b${value}`;
      this.state.fullItemList.forEach(el => {
        if (el.name.search(new RegExp(reg, "i")) !== -1) {
          found.push(el);
        }
      });

      this.setState({
        searchValue: value,
        searchItemList: found,
      });
    } else {
      this.setState({
        searchValue: value,
        searchItemList: null,
      });
    }
  }

  changeDetails(event) {
    const { value } = event.target;
    this.setState({
      details: value,
    });
  }

  confirmCancel() {
    confirm({
      title: 'Are you sure you want to cancel?',
      content: 'The request will not be created',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk : () => this.props.history.push(`/requests`),
    });
  }

  requestSelection(e) {
    this.setState({
      requestTypeValue: e.target.value,
    });
  }

  async createNewRequest() {
    this.setState({ saving: true });

    const newIndustryRequest = {
      details: this.state.details,
      content: this.state.requestedItems,
      type: this.state.requestTypeValue,
    };

    try {
      await request.post({
        path: '/api/v1/requests',
        data: newIndustryRequest,
      });

      this.setState({ saving: false });
      this.props.history.push(`/requests`);
    } catch (e) {
      this.setState({
        error: e.message,
        saving: false,
      });
    }
  }

  render() {
    const { sourceItemHierarchy, searchItemList } = this.state;

    const elementsList = searchItemList === null
      ? _.map(
        sourceItemHierarchy,
        i => this.mapHierarchyData(i),
      )
      : _.map(
        searchItemList,
        i => this.mapHierarchyData(i),
      );

    const columns = [
      {
        title: 'Element',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (text, record) => (
          <InputNumber
            min={1}
            max={100000}
            defaultValue={1}
            value={text}
            size='large'
            onChange={value => this.changeQuantity(value, record.key)}
          />
        ),
      },
      {
        title: 'Action',
        key: 'operation',
        align: 'right',
        width: 100,
        render: (el) => (<Button
          className='RequestNew-delete-action'
          type='danger'
          shape='circle'
          icon={<DeleteOutlined />}
          key='delete'
          onClick={() => this.deleteItem(el.key)}
        />),
      },
    ];

    return (<>
      <TopBar
        backButton={true}
        title={<b>INDUSTRY REQUESTS - NEW</b>}
      />
      <Layout className='RequestNew'>
        <Sider
          width='450'
          style={{ background: 'none', padding: '1em', borderRight: '1px dashed lightgray' }}
        >
          <h2 className="available-header">AVAILABLE ITEMS:</h2>
          <span className='RequestNew-add-button'>
            <Tooltip title={this.state.addButtonTooltip}>
              <Button
                disabled={this.state.addButtonTooltip}
                type="primary"
                key='addItem'
                onClick={this.addRequestedElement.bind(this)}
              >
                <RightOutlined />
                Add
              </Button>
            </Tooltip>
          </span>
          <Search
            style={{ marginBottom: 8 }}
            placeholder="Search Item"
            key='searchInput'
            value={this.state.searchValue}
            onChange={this.onSearch.bind(this)}
          />
          <Tree
            className="RequestNew-tree"
            selectable
            bordered
            autoExpandParent
            key='elementsTree'
            treeData={elementsList}
            onExpand={this.onExpand.bind(this)}
            expandedKeys={this.state.expandedKeys}
            onSelect={this.onSelect.bind(this)}
          />
        </Sider>
        <Layout>
          <Content
            style={{ padding: '1em' }}
          >
            {this.state.error && (
              <Alert
                style={{ 'marginBottom': '0.5em' }}
                message="Error"
                description={this.state.error}
                type="error"
                showIcon
              />
            )}
            {this.state.saving && (
              <Alert
                style={{ 'marginBottom': '0.5em' }}
                message="Saving..."
                type="info"
              />
            )}
            <Table
              columns={columns}
              dataSource={this.state.requestedItems}
              pagination={{ pageSize: 10 }}
              rowKey={el => el.name}
              locale={{
                emptyText: <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={`
                  Empty, please select one item from the list on the left and click "Add"
                  `}
                />,
              }}
            />
            <div className='RequestNew-details'>
              <span className='input-details'>
                <InfoCircleOutlined
                  style={{ fontSize: '16px', width: '30px' }}
                />
                <b>Details :</b>
              </span>
              <TextArea
                type="textarea"
                className='input-details'
                placeholder='(e.g. "Creation of a new H A V O C Freighter, delivery expected on Madis")'
                maxLength={5000}
                autoSize={{ minRows: 2, maxRows: 10 }}
                onChange={this.changeDetails.bind(this)}
              />
            </div>
            <div className='RequestNew-type'>
              <h3>PLEASE SELECT A REQUEST TYPE</h3>
              <Radio.Group
                onChange={this.requestSelection.bind(this)}
                buttonStyle="solid">
                <Radio.Button value="personal">Personal</Radio.Button>
                <Radio.Button value="organization">Organization</Radio.Button>
                <Radio.Button value="trading">Trading</Radio.Button>
              </Radio.Group>
            </div>
            <Footer
              style={{ textAlign: 'right' }}
            >
              <Button
                type='normal'
                align='left'
                size='large'
                style={{ marginLeft: '1em', left: '2em' }}
                onClick={this.confirmCancel.bind(this)}
              >
                Cancel
                <UndoOutlined />
              </Button>
              <Button
                type='primary'
                align='right'
                size='large'
                disabled={!this.state.createButtonEnabled}
                style={{ marginLeft: '1em', left: '2em' }}
                onClick={this.createNewRequest.bind(this)}
              >
                Create
                <CheckOutlined />
              </Button>
            </Footer>
          </Content>
        </Layout>
      </Layout>
    </>);
  }
}

export default RequestNew;
