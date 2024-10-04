import React from 'react';
import InputField from './InputField';
import '../../css/components/ShipForm.less';

class ShipForm extends React.Component {
  render() {
    const {
      editing,
      shipCategoryOptions,
    } = this.props;

    const {
      id,
      name,
      coreSize,
      categoryId,
      emptyWeightTons,
      maxCargoTons,
      maxWeightTons,
      maxVelocityKMPerH,
      atmoThrustG,
      atmoBrakingG,
      spaceThrustG,
      spaceBrakingG,
    } = this.props.ship;

    if (shipCategoryOptions.length === 0) {
      return (
        <div className="ShipForm">
          <p>No ship categories available</p>
        </div>
      );
    }

    return (
      <div className="ShipForm">
        <div className="ShipForm-header">
          <h2 className="ShipForm-header-text">
            <InputField
              hint="Ship name"
              editing={editing}
              object={this.props.ship}
              path={'name'}>
              {name}
            </InputField>
          </h2>
          <span className="ShipForm-header-id">ID #{id}</span>
        </div>
        <div className="line-horizontal"/>
        <div className="ShipForm-info">
          <div className="ShipForm-info-block">
            <div>
              <div className="dim-caption">Core size:</div>
              <InputField
                editing={editing}
                type="select"
                options={[
                  { value: 'XS', title: 'XS' },
                  { value: 'S', title: 'S' },
                  { value: 'M', title: 'M' },
                  { value: 'L', title: 'L' },
                ]}
                defaultOption={0}
                object={this.props.ship}
                path={'coreSize'}
              >
                {coreSize}
              </InputField>
            </div>
            <div>
              <div className="dim-caption">Category:</div>
              <InputField
                editing={editing}
                type="select"
                options={shipCategoryOptions}
                object={this.props.ship}
                defaultOption={0}
                path={'categoryId'}
              >
                {categoryId}
              </InputField>
            </div>
          </div>
          <div className="ShipForm-info-block">
            <div className="dim-caption">Empty weight (tons):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'emptyWeightTons'}
            >
              {emptyWeightTons}
            </InputField>
            <div className="dim-caption">Max cargo (tons):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'maxCargoTons'}
            >
              {maxCargoTons}
            </InputField>
            <div className="dim-caption">Max weight (tons):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'maxWeightTons'}
            >
              {maxWeightTons}
            </InputField>
          </div>
          <div className="ShipForm-info-block">
            <div className="dim-caption">Max velocity (km/h):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'maxVelocityKMPerH'}
            >
              {maxVelocityKMPerH}
            </InputField>
            <div className="dim-caption">Thust in atmosphere (G):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'atmoThrustG'}
            >
              {atmoThrustG}
            </InputField>
            <div className="dim-caption">Braking in atmosphere (G):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'atmoBrakingG'}
            >
              {atmoBrakingG}
            </InputField>
            <div className="dim-caption">Thrust in space (G):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'spaceThrustG'}
            >
              {spaceThrustG}
            </InputField>
            <div className="dim-caption">Braking in space (G):</div>
            <InputField
              type="number"
              min={0}
              editing={editing}
              object={this.props.ship}
              path={'spaceBrakingG'}
            >
              {spaceBrakingG}
            </InputField>
          </div>
        </div>
      </div>
    );
  }
}

export default ShipForm;
