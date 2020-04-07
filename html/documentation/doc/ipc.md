# IPC
Electron makes use of 2 types of processes: *main and render*. There is only 1 main process, and every window has its own render process. In order to communicate between these processes ipc, or inter-process communication, is used. This document will set the guidelines for ipc between the render processes and the main process.

## Front and back
The relation between the render process and the main process is comparable to front- and back-end in a website. However there is 1 big difference: in electron communication between the front and back do not use the internet. This makes the cost of sending data cheaper than in web development, which leads to the following design decision:

The front of the application has 3 things it should be able to do:

- Update display based on data recieved from the back.
- Directly send actions to the back.
- Handle anything that the back doesn't need to know about itself (e.g. drag and drop for a tabbing system).

Rather than updating the display directly the logic first flows through the back of the application. This helps creating a clear logical structure, avoids data duplication, and is more resistant to bugs at the cost of a little performance. There is, however, an exception: whenever something is updated too regularly (e.g. if the mouse mosition is followed every movement, or there is a big text box), it is better to queue any changes and send everything to the back at once (usually whenever the user un-focusses, stops dragging, etc.).