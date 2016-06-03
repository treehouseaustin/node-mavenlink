# node-mavenlink

Intended to be a lightweight Node wrapper for the [Mavenlink API](http://developer.mavenlink.com/).

* Requires Mavenlink OAuth Token to run
* default items per page is 200 *(max value)*
* all `getAll` methods will get all the items in all pages
* `page` is the page number that you want to fetch

Currently implemented:

### Generic
* `get(endpointUrl, options)`: generic API wrapper

### Workspaces(Projects) [Info](http://developer.mavenlink.com/workspaces)
* `getProjects(page)`
* `getAllProjects()`

### Tasks(Stories) [Info](http://developer.mavenlink.com/stories)
* `getTasks(page)`
* `getAllTasks()`

### Custom Field Values [Info](http://developer.mavenlink.com/custom_field_values)
* `getProjectsCustomFields(page)`
* `getAllProjectsCustomFields()`

### Comments(Posts) [Info](http://developer.mavenlink.com/posts)

* `getComments(page)`
* `getAllComments()`
* `getCommentsForProject(page, projectId)`
* `getAllCommentsForProject(projectId)`
