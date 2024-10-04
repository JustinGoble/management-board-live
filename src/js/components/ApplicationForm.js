import React from 'react';
import InputField from './InputField';
import '../../css/components/ApplicationForm.less';
class ApplicationForm extends React.Component {
  render() {
    const {
      editing,
    } = this.props;

    const {
      discordName,
      age,
      matchDiscord,
      inGameName,
      hearAbout,
      appeals,
      experiences,
      doingTogeather,
      haveDU,
      playtime,
      favGames,
      other,
    } = this.props.application;
    return (
      <div className="ApplicationForm">
        <div className="ApplicationForm-info">
          <div>
            <div className="dim-caption">What is your Discord name?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'discordName'}
            >
              {discordName}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">Are you 18 years old or older?</div>
            <InputField
              type="radio"
              editing={editing}
              options={[
                { value: true, title: 'Yes' },
                { value: false, title: 'No' },
              ]}
              object={this.props.application}
              defaultOption={1}
              path={'age'}
            >
              {age}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">Does your in-game name match your Discord name?</div>
            <InputField
              type="radio"
              editing={editing}
              options={[
                { value: true, title: 'Yes' },
                { value: false, title: 'No' },
              ]}
              object={this.props.application}
              defaultOption={0}
              path={'matchDiscord'}
            >
              {matchDiscord}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">If not, what is your in-game name? (N/A if you don't have the game)</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'inGameName'}
            >
              {inGameName}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">How did you hear about Objective Driveyards?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'hearAbout'}
            >
              {hearAbout}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">What appeals to you about ODY?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'appeals'}
            >
              {appeals}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">What are some useful skills you bring to the table?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'experiences'}
            >
              {experiences}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">What are some things you are looking forward to doing together with us?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'doingTogeather'}
            >
              {doingTogeather}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">Have you already bought DU?</div>
            <InputField
              type="radio"
              editing={editing}
              options={[
                { value: true, title: 'Yes' },
                { value: false, title: 'No' },
              ]}
              object={this.props.application}
              defaultOption={0}
              path={'haveDU'}
            >
              {haveDU}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">If so, how much have you played the game?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'playtime'}
            >
              {playtime}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">What are some of your favorite video games?</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'favGames'}
            >
              {favGames}
            </InputField>
          </div>
          <div>
            <div className="dim-caption">Is there anything else you'd like to mention? (Type none if not)</div>
            <InputField
              editing={editing}
              object={this.props.application}
              path={'other'}
            >
              {other}
            </InputField>
          </div>
        </div>
      </div>
    );
  }
}

export default ApplicationForm;
