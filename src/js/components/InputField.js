import _ from 'lodash';
import React from 'react';
import { Input, Select, Tag, Radio, InputNumber } from 'antd';
import '../../css/components/InputField.less';

const { TextArea } = Input;
const { Option } = Select;

class InputField extends React.Component {
  handleChange = (event) => {
    const value = _.get(event, 'target.value', event);
    _.set(this.props.object, this.props.path, value);
    this.setState({});
  }

  parseTagColor = (color) => color ? `#${color.toString(16)}` : "blue";

  render() {
    let { children } = this.props;

    const {
      id,
      editing,
      type,
      options,
      autoSize,
      defaultOption,
      hint,
      object,
      path,
      min,
      max,
    } = this.props;

    // Convert options and values to strings because Ant Design components
    // can't handle number keys
    _.forEach(options, o => {
      if (!_.isNil(o.value)) {
        o.value = `${o.value}`;
      }
    });
    if (_.isArray(children)) {
      children = _.map(children, c => `${c}`);
    } else if (!_.isNil(children)) {
      children = `${children}`;
    }

    if (type === 'tag') {
      if (editing) {
        const defaultValue = _.cloneDeep(children);
        return (
          <span className="InputField">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Please select"
              defaultValue={defaultValue}
              onChange={this.handleChange}
            >
              {_.map(options, (option) => (
                <Option
                  id={id}
                  key={option.value}
                  color={"blue"}
                >{option.title}</Option>
              ))}
            </Select>
          </span>
        );
      }

      if (_.isEmpty(children)) {
        return <span style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {"<Empty list>"}
        </span>;
      }

      return (
        <span className="InputField">
          {_.map(
            _.filter(options, o => _.includes(children, o.value)),
            (option) => (
              <Tag
                id={id}
                key={option.value}
                color={this.parseTagColor(option.color)}
              >{option.title}</Tag>
            ),
          )}
        </span>
      );
    }

    if (editing) {
      if (type === 'radio') {
        let defaultValue = _.get(object, path, _.cloneDeep(children));
        if (defaultValue === undefined) {
          defaultValue = defaultOption !== undefined
            ? options[defaultOption].value
            : undefined;
          _.set(object, path, defaultValue);
        }

        return (
          <span className="InputField">
            <Radio.Group onChange={this.handleChange} value={defaultValue}>

              {_.map(options, (option) => (
                <Radio
                  value={option.value}
                  key={option.value}
                  color={"blue"}
                >{option.title}</Radio>
              ))}
            </Radio.Group>

          </span>
        );
      }

      if (type === 'select') {
        let defaultValue = _.cloneDeep(children);

        if (defaultValue === undefined) {
          defaultValue = defaultOption !== undefined
            ? options[defaultOption].value
            : undefined;
          _.set(object, path, defaultValue);
        }

        return (
          <span className="InputField">
            <Select
              id={id}
              key={children}
              className="form-control"
              defaultValue={defaultValue}
              onChange={this.handleChange}
            >
              {options.map((o, i) => (
                <Option key={i} value={o.value}>
                  {o.title}
                </Option>
              ))}
            </Select>
          </span>
        );
      }

      if (type === 'number') {
        return (
          <span className="InputField">
            <InputNumber
              id={id}
              key={children}
              className="form-control"
              min={min}
              max={max}
              defaultValue={children}
              onChange={this.handleChange}
              stringMode
            />
          </span>
        );
      }

      return (
        <span className="InputField">
          <TextArea
            id={id}
            key={children}
            placeholder={hint}
            defaultValue={children}
            onInput={(e) => this.handleChange(e.target.value)}
            className="form-control"
            autoSize={autoSize || true}
          />
        </span>
      );
    }

    let displayValue = children;
    if (type === 'select') {
      displayValue = _.get(_.find(options, { value: displayValue }), 'title');
      if (displayValue === 'false') {
        displayValue = 'No';
      }
      if (displayValue === 'true') {
        displayValue = 'Yes';
      }
    }

    return (
      // Do not give an ID to this field.
      // Do styling in the parent element.
      <span className="InputField">
        <span style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {displayValue || "<No value>"}
        </span>
      </span>
    );
  }
}

export default InputField;
