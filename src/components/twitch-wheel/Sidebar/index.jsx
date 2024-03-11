/* eslint-disable react/prop-types */
import { Component } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import './Sidebar.css';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.getHistoryList = this.getHistoryList.bind(this);
    this.getNextGameName = this.getNextGameName.bind(this);
    this.getNextGamePartyPack = this.getNextGamePartyPack.bind(this);
    this.hasNextGame = this.hasNextGame.bind(this);
    this.moveNextGameBack = this.moveNextGameBack.bind(this);
    this.moveNextGameFwd = this.moveNextGameFwd.bind(this);
    this.printGame = this.printGame.bind(this);
  }

  getHistoryList = (history) => {
    if (history.length === 0) {
      return (
        <span className="history-placeholder" key="placeholder">No games yet</span>
      );
    }
    /*return (
      <Droppable droppableId="historyList">
        {(provided) => (
          <span className="historyList" {...provided.droppableProps} ref={provided.innerRef}>
            {history.map(({name, time}, index) => {
              return (
                <Draggable key={`${time}${name}`} draggableId={`${time}`} index={index}>
                  {(provided) => (
                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      {this.printGame(index)}
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </span>
        )}
      </Droppable>
    );*/
    return (
      <span className="historyList" data-rbd-droppable-id="historyList" data-rbd-droppable-context-id="0">
        {history.map(({name, time}, index) => {
          return (
            <li key={`${time}${name}`} data-draggableId={`${time}`} data-index={index}>
              {this.printGame(index)}
            </li>
          );
        })}
      </span>
    );
  };

  getNextGameName = () => {
    return this.hasNextGame()
      ? this.props.history[this.props.nextGameIdx].name
      : 'not yet decided';
  };

  getNextGamePartyPack = () => {
    return this.hasNextGame()
      ? this.props.history[this.props.nextGameIdx].partyPack
      : null;
  };

  handleOnDragEnd = (result) => {
    if (!result.destination) {return;}

    const _items = Array.from(this.props.history).fill();
    _items[this.props.nextGameIdx] = true;
    const [_reorderedItem] = _items.splice(result.source.index, 1);
    _items.splice(result.destination.index, 0, _reorderedItem);

    const newNextGameIdx = _items.findIndex(i => i);

    const items = Array.from(this.props.history);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    this.props.changeGameOrder(items, newNextGameIdx);
  };

  hasNextGame = () => {
    return this.props.history.length > this.props.nextGameIdx;
  };

  moveNextGameFwd = () => {
    return this.props.changeNextGameIdx(1);
  };

  moveNextGameBack = () => {
    return this.props.changeNextGameIdx(-1);
  };

  removeSelectedGameFromHistory = () => {
    return this.props.removeSelectedGameFromHistory();
  };

  printGame = (idx) => {
    if (idx === this.props.nextGameIdx) {
      return (
        <b>{this.props.history[idx].name}</b>
      );
    }
    return this.props.history[idx].name;
  };

  render() {
    let nextGame = this.hasNextGame();

    let buttonPlayerSelect;
    switch (this.props.requestMode) {
    case 'game':
      buttonPlayerSelect = (
        <button id="sidebar-up-next" className="open-seat-requests" disabled={!nextGame} onClick={this.props.togglePlayerSelect}>
          OPEN SEAT REQUESTS
        </button>
      );
      break;
    case 'seat':
      buttonPlayerSelect = (
        <button id="sidebar-up-next" className="return-to-wheel" onClick={this.props.togglePlayerSelect}>
          RETURN TO WHEEL
        </button>
      );
      break;
    default:
      break;
    }

    return (
      <div id="sidebar" className={this.props.requestMode}>
        <div className="card sidebar-panel">
          <div className="card-header fw-bolder">
            Up Next
          </div>
          <div className="card-body sidebar-up-next-panel">
            <h5 className="card-title mb-2 fw-bolder">
              <button className="cancel-game" onClick={this.removeSelectedGameFromHistory}>X</button>
              {this.getNextGameName()}
            </h5>
            <div className="card-subtitle mb-2 fs-7 fst-italic text-light"
              style={{'--bs-text-opacity': '0.75'}}>
              {this.getNextGamePartyPack()}
            </div>

            {buttonPlayerSelect}
          </div>
        </div>

        <div className="nav-wrapper py-2">
          <button className="btn-sm move-next-game-back" onClick={this.moveNextGameBack}> &#8678; </button>
          <button className="btn-sm move-next-game-fwd" onClick={this.moveNextGameFwd}> &#8680; </button>
        </div>

        <div className="card sidebar-panel">
          {/* <DragDropContext onDragEnd={this.handleOnDragEnd}> */}
          <div className="card-header fw-bolder">
            History
          </div>
          <div className="card-body sidebar-history-list-panel">
            {this.getHistoryList(this.props.history)}
          </div>
          {/* </DragDropContext> */}
        </div>
      </div>
    );
  }
}
