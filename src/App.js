import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class CPUSchedulingSimulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processes: [],
      initialProcesses: [],
      currentTime: 0,
      completedProcesses: [],
      isRunning: false,
      isSimulated: false,
      isPaused: false,
    };
    this.processNameInput = React.createRef();
    this.processArrivalTimeInput = React.createRef();
    this.processTimeInput = React.createRef();
    this.runTimeout = null;
  }

  // handleRunSimulation = () => {
  //   const { processes, currentTime, completedProcesses } = this.state;
  
  //   if (processes.length === 0) {
  //     alert('Danh sách tiến trình trống!');
  //     return;
  //   }
  
  //   const availableProcesses = processes.filter(process => process.time > 0);
  
  //   if (availableProcesses.length === 0) {
  //     alert('Hết tiến trình');
  //     return;
  //   }
  
  //   // Sắp xếp các tiến trình theo thời gian chờ đợi (thời gian đến - thời gian đã chạy)
  //   availableProcesses.sort((a, b) => {
  //     const waitingTimeA = a.arrivalTime - currentTime;
  //     const waitingTimeB = b.arrivalTime - currentTime;
  
  //     if (waitingTimeA === waitingTimeB) {
  //       return a.time - b.time; // Nếu thời gian chờ đợi bằng nhau, sắp xếp theo CPU burst time
  //     }
  
  //     return waitingTimeA - waitingTimeB;
  //   });
  
  //   const nextProcess = availableProcesses[0];
  //   const remainingProcesses = processes.map(process =>
  //     process.id === nextProcess.id ? { ...process, time: process.time - 1 } : process
  //   );
  
  //   this.setState({
  //     processes: remainingProcesses,
  //     currentTime: currentTime + 1,
  //     completedProcesses: [
  //       ...completedProcesses,
  //       { id: nextProcess.id, startTime: currentTime, endTime: currentTime + 1 },
  //     ],
  //   });
  
  //   setTimeout(this.handleRunSimulation, 400);
  // };
  
  handleRunSimulation = async () => {
    const { processes, currentTime, completedProcesses, isSimulated, isPaused } = this.state;
  
    if (processes.length === 0) {
      alert('Danh sách tiến trình trống!');
      return;
    }
  
    const availableProcesses = processes.filter(process => process.time > 0);
  
    if (availableProcesses.length === 0) {
      alert('Hết tiến trình');
      return;
    }
  
    // Sắp xếp các tiến trình theo thời gian chờ đợi (thời gian đến - thời gian đã chạy)
    availableProcesses.sort((a, b) => {
      const waitingTimeA = a.arrivalTime - currentTime;
      const waitingTimeB = b.arrivalTime - currentTime;
  
      if (waitingTimeA === waitingTimeB) {
        return a.time - b.time; // Nếu thời gian chờ đợi bằng nhau, sắp xếp theo CPU burst time
      }
  
      return waitingTimeA - waitingTimeB;
    });
  
    const nextProcess = availableProcesses[0];
    const remainingProcesses = processes.map(process =>
      process.id === nextProcess.id ? { ...process, time: process.time - 1 } : process
    );
  
    this.setState({
      processes: remainingProcesses,
      currentTime: currentTime + 1,
      completedProcesses: [
        ...completedProcesses,
        { id: nextProcess.id, startTime: currentTime, endTime: currentTime + 1 },
      ],
      isRunning: true, // Set isRunning to true when the simulation is running
    });
  
    if (remainingProcesses.every(process => process.time === 0)) {
      // Nếu tất cả tiến trình đã chạy xong, cập nhật trạng thái sau khi mô phỏng
      await this.sleep(400); // Chờ 400ms để thấy trạng thái cuối cùng trước khi cập nhật nút
      this.setState({
        isRunning: false,
        isSimulated: true,
      });
    } else {
      // Nếu vẫn còn tiến trình chưa chạy xong, tiếp tục mô phỏng
      this.runTimeout = setTimeout(this.handleRunSimulation, 400);
    }
  };
  
  handleStop = () => {
    this.clearRunTimeout();
    this.setState({
      isRunning: false,
    });
  };
  
  handleContinue = () => {
    this.setState({ 
      isPaused: false, 
      isRunning: true,
    });
  };
  

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  handleAddProcess = () => {
    const { isRunning, isSimulated } = this.state;
    const name = this.processNameInput.current.value;
    const time = parseInt(this.processTimeInput.current.value, 10);
    const arrivalTime = parseInt(this.processArrivalTimeInput.current.value, 10);

    if (isRunning) {
      alert('Dừng mô phỏng trước khi thêm tiến trình.');
      return;
    }

    if (isSimulated) {
      alert('Mô phỏng đã hoàn thành, bạn cần ấn "Refresh" để chạy lại.');
      return;
    }

    if (name && time >= 0 && arrivalTime >= 0) {
      // Generate a unique id for the process
      const id = Date.now();

      // Check if the name already exists in the processes
      if (this.state.initialProcesses.some(process => process.name === name)) {
        alert('Tên tiến trình đã tồn tại. Vui lòng chọn tên khác.');
        return;
      }

      // Update state with the new process
      this.setState(prevState => ({
        processes: [...prevState.processes, { id, name, time, arrivalTime }],
        initialProcesses: [...prevState.initialProcesses, { id, name, time, arrivalTime }],
      }));
      this.processNameInput.current.value = '';
      this.processTimeInput.current.value = '';
      this.processArrivalTimeInput.current.value = '';
    } else {
      alert('Vui lòng điền đầy đủ thông tin tiến trình và đảm bảo giá trị Thời gian Đến và Thời gian Burst CPU là không âm.');
    }
  };

  handleDeleteProcess = id => {
    const { isRunning, isSimulated } = this.state;

    if (isRunning) {
      alert('Dừng mô phỏng trước khi xóa tiến trình.');
      return;
    }

    if (isSimulated) {
      alert('Mô phỏng đã hoàn thành, bạn cần ấn "Refresh" để xóa tiến trình.');
      return;
    }

    const updatedProcesses = this.state.processes.filter(process => process.id !== id);
    this.setState(prevState => ({
      processes: updatedProcesses,
      initialProcesses: prevState.initialProcesses.filter(process => process.id !== id),
      currentTime: 0,
      completedProcesses: [],
    }));
  };

  handleResetPage = () => {
    const { isRunning } = this.state;

    if (isRunning) {
      alert('Dừng mô phỏng trước khi đặt lại.');
      return;
    }

    this.setState({
      processes: [],
      initialProcesses: [],
      currentTime: 0,
      completedProcesses: [],
      isRunning: false,
      isSimulated: false,
      isPaused: false,
    });
  };

  handleReFresh = () => {
    const { isRunning, initialProcesses } = this.state;

    if (isRunning) {
      alert('Dừng mô phỏng trước khi đặt lại.');
      return;
    }

    this.setState({
      processes: [...initialProcesses],
      currentTime: 0,
      completedProcesses: [],
      isRunning: false,
      isSimulated: false,
      isPaused: false,
    });
  };

  // handleStop = () => {
  //   this.clearRunTimeout();
  // };

  // handleContinue = () => {
  //   this.setState({ isPaused: false }, () => {
  //     this.runStep();
  //   });
  // };

  clearRunTimeout = () => {
    if (this.runTimeout) {
      clearTimeout(this.runTimeout);
    }
    this.setState({ isPaused: true });
  };

  render() {
    const { initialProcesses, isRunning, isSimulated, isPaused } = this.state;
    const totalTime = 200;
    const columnWidth = 10;
    const currentTime = this.state.currentTime;

    return (
      <div className="cpu-scheduling-simulation">
        <br />
        <h2>Nguyên lý hệ điều hành</h2>
        <h2>Bài tập lớn: Mô phỏng giải thuật lập lịch CPU SRTF (Shortest Remaining Time First)</h2>
        <div className="process-list">
          <h2>Process List</h2>
          <table>
            <thead>
              <tr>
                <th>Process name</th>
                <th>Arrival Time</th>
                <th>CPU Burst Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialProcesses.map(process => (
                <tr key={process.id}>
                  <td>{process.name}</td>
                  <td>{process.arrivalTime}</td>
                  <td>
                    {process.name === 'CPU Burst Time' ? (
                      <div>{process.time}</div>
                    ) : (
                      process.time
                    )}
                  </td>
                  <td>
                    <button onClick={() => this.handleDeleteProcess(process.id)} disabled={isRunning}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        <div className="add-process-form">
          <input type="text" placeholder="Process name" ref={this.processNameInput} />
          <input type="number" placeholder="Arrival Time" ref={this.processArrivalTimeInput} />
          <input type="number" placeholder="CPU Burst Time" ref={this.processTimeInput} />
          <button onClick={this.handleAddProcess}>Add</button>
        </div>
        <div className="controls">
          <div>
            <button onClick={isRunning ? null : isSimulated ? this.handleReFresh : this.handleRunSimulation} disabled={isRunning}>
              {isRunning ? 'Running...' : isSimulated ? 'Refresh' : 'Run'}
            </button>
            <button onClick={this.handleResetPage} disabled={isRunning}>
              Reset
            </button>
            <button onClick={this.handleStop} disabled={!isRunning || isPaused}>
              Stop
            </button>
            <button onClick={this.handleContinue} disabled={!isPaused || isSimulated}>
              Continue
            </button>
          </div>
        </div>
        <div className='moPhong'>Mô phỏng</div>
        <div className="table-container">
          <div className="table-scroll">
            <table className="process-table">
              <thead>
                <tr>
                  <th>Process name</th>
                  {Array(totalTime)
                    .fill()
                    .map((_, index) => (
                      <th
                        key={index}
                        className={currentTime === index + 1 ? 'running' : ''}
                        style={{ width: columnWidth }}
                      >
                        {index}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {initialProcesses.map(process => (
                  <tr key={process.id}>
                    <td>{process.name}</td>
                    {Array(totalTime)
                      .fill()
                      .map((_, index) => (
                        <td
                          key={index}
                          className={
                            this.state.completedProcesses.some(item => {
                              return item.id === process.id && index >= item.startTime && index < item.endTime;
                            })
                              ? 'completed'
                              : ''
                          }
                          style={{ width: columnWidth }}
                        ></td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <div className="App" >
      <CPUSchedulingSimulation />
    </div>
  );
}

export default App;