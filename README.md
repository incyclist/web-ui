# Incyclist Web UI

This repository contains the Web User Interface of the Incyclist indoor cycling app. 

Incyclist has been designed in a way that is User Interfaces can be exchanged and are referenced by the application that contains the binary ( Desktop app, Mobile app). The User Interface should not contain business logic. The business logic is imported from the incyclist-services library.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode on localhost (port 3000)<br>

In this mode, it is assumed that you also have cloned the repositories incyclist-devices and incyclist-services so that your directory structure looks like this

```
common-base
├── web-ui (current directory)
├── services
└── devices
```

In this mode, all changes made to the local repository, incyclist-services or incylcist-devices will automatically update the application exposed on port 3000

The page will reload if you make edits.<br>

If you want to test the code updates in the desktop or mobile app, you have to 
change settings.json to point to the local installation, by adding the following lines
```
  "pageUrl": "http://localhost:3000",
  "logRest": {
    "url": "http://localhost:5001/api/v1/log" 
  }
```
The changes to logRest are made to disable server logging during debugging. It should point to any local endpoint (which will be ignored if no process is listenting )

If you want to test in the browser, just open [http://localhost:3000](http://localhost:3000) to view it in the browser. The UI in the browser however has limited support for app features ( local file access, BLE, ANT, ....)


### `npm run storybook`

Launches Storybook to allow visual inspections of the components. Just open 
 [http://localhost:6006](http://localhost:6006) to perform this inspection

### `npm run build`

Builds a production bundle to the `build` folder.<br> 

The production bundle is used by the App to implement automatic update of the Web-UI
Currently these bundle updates are only provided by the Incyclist backend. 

Contact me if you want to setup your own bundle update server.


## Code Structure & Design Considerations

Please read [./docs/CODEBASE_GUIDE.md](./docs/CODEBASE_GUIDE.md)