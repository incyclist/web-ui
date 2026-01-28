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


## Code Structure

In the [src](.src) directory, you find the following main folders:

- [bindings](./src/bindings) - Contains bindings to the features provided by the container that is serving the app ( desktop app, mobile app, browser). 

- [components](./src/components/) - Contains the UI Components. These components are organized in three layers

  1. [atoms](./src/components/atoms/) Base components that don't depend on any other component in this repo
  2. [molecules](./src/components/atoms/) Components that aggregate atoms but don't have any dependency to other molecules or modules
  3. [modules](./src/components/atoms/) higher level components which are aggregated from atoms, molecules and/or external components


- [hooks](./src/hooks/) - Contains reusable React hooks 

- [pages](./src/pages/) - Contains the UI of the main pages of the app ( pairing, route list, search , workouts, activities, ride). 

- [utils](./src/utils/) - Generic re-usable utility functions (e.g. sleep(), clone(),...)


## Design Considerations

- Try to use functional components as much as possible. Only use class components if really necessary

- Don't implement business logic in the UI. Every business logic should be implemented in incyclist-services.

- If a component requires business logic (served by incyclist-services), split the component into two parts: 
  - A Wrapper that interacts with the services and thus can update its internal state based on business logic provided by the service
  - A View that can be inspected in all possible combinations in Storybook

- If you expect a lot of updates in a component that sits deeply on the DOM of a page, use observers and the `<Dynamic>` component to enforce updates only on this component, without re-rendering the whole page/component

- As the UI was originally intended to be running on TV's the CSS is currently optimized for TV and in most cases I use `vw` and `vh` to indicated sized of components or text elements. 

- To avoid app crashes due to unhandled expections, use the `<ErrorBoundary>` component at least on module level. 

- Any user interaction should be logged, so that problems can be easier reproduced.

- Don't log any personal data (name, email, ....)
