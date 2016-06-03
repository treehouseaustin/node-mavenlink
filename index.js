const qs = require('querystring');
const request = require('request');
const Processor = require('./processor');

class MavenlinkAPI {

  constructor(accessToken) {
    this.token = accessToken;
    this.rootURL = 'https://api.mavenlink.com/api/v1';
    this.perPage = 200;
    this.processor = new Processor();
  }

  /**
   * Generic method for making get request to mavenlink
   * @param {String} endpoint The endpoint url to fetch data from
   * @param {Object} options querystring params
   * @return {Promise} Promise will return when the request is fulfilled
   */
  get(endpoint, options) {
    return new Promise((resolve, reject) => {
      request.get({
        url: `${this.rootURL}/${endpoint}?${qs.stringify(options)}`,
        headers: { authorization: `bearer ${this.token}` }
      }, function(err, res) {
        if (err || !res || !JSON.parse(res.body)) return reject(err);
        var response = JSON.parse(res.body);
        if (response.errors) return reject(new Error(response.errors));
        resolve(response);
      });
    });
  }

  /**
   * Get projects(workspaces) for certain page
   * @param {Number} page page number to fetch
   * @return {Promise} Object contains projects(workspaces) returned and meta data about them
   */
  getProjects(page) {
    return this.get('workspaces.json', { per_page: this.perPage, page }).then(result => {
      return this.processor.processResult(result, 'workspaces');
    });
  }

  /**
   * Get all projects
   * @return {Promise} array of projects(workspaces) returned from mavelink
   */
  getAllProjects() {
    return this.loadAllItems(this.getProjects.bind(this));
  }

  /**
   * Get parent tasks(stories) for certain page
   * @param {Number} page page number to fetch
   * @return {Promise} Object contains tasks(stories) returned and meta data about them
   */
  getTasks(page) {
    return this.get('stories.json', {
      parents_only: true,
      include: 'assignees',
      per_page: this.perPage,
      page
    }).then(result => {
      return this.processor.processResultWithRelation(result, 'stories', {
        relatedField: 'assignee_ids',
        relatedObject: 'users',
        renameTo: 'assignees'
      });
    });
  }

  /**
   * Get all tasks
   * @return {Promise} array of tasks(stories) returned from mavelink
   */
  getAllTasks() {
    return this.loadAllItems(this.getTasks.bind(this));
  }

  /**
   * Get projects' custom fields for certain page (used for getting sfid)
   * @param {Number} page page number to fetch
   * @return {Promise} Object contains custom fields related to projects returned and meta data about them
   */
  getProjectsCustomFields(page) {
    return this.get('custom_field_values.json', { per_page: this.perPage, page, subject_type: 'Workspace' }).then(result => {
      return this.processor.processResult(result, 'custom_field_values');
    });
  }

  /**
   * Get all projects' custom fields
   * @return {Promise} array of custom fields related to projects returned from mavelink
   */
  getAllProjectsCustomFields() {
    return this.loadAllItems(this.getProjectsCustomFields.bind(this));
  }

  /**
   * Get parent comments(posts)
   * @param {Number} page page number to fetch
   * @return {Promise} Object contains comments returned and meta data about them
   */
  getComments(page) {
    return this.get('posts.json', {
      per_page: this.perPage,
      parents_only: true,
      page
    }).then(result => {
      return this.processor.processResult(result, 'posts');
    });
  }

  /**
   * Get all parent comments(posts)
   * @return {Promise} Array of all parent comments
   */
  getAllComments() {
    return this.loadAllItems(this.getComments.bind(this));
  }

  /**
   * Get parent comments(posts) for a project(workspace)
   * @param {Number} page page number to fetch
   * @param {String} projectId project id that the comments belongs to
   * @return {Promise} Object contains comments returned and meta data about them
   */
  getCommentsForProject(page, projectId) {
    return this.get('posts.json', {
      per_page: this.perPage,
      parents_only: true,
      workspace_id: projectId,
      page
    }).then(result => {
      return this.processor.processResult(result, 'posts');
    });
  }

  /**
   * Get all parent comments(posts) for a project(workspace)
   * @param {String} projectId project id that the comments belongs to
   * @return {Promise} Array of all parent comments that are related to projectId
   */
  getAllCommentsForProject(projectId) {
    return this.loadAllItems(this.getCommentsForProject.bind(this), projectId);
  }

  /**
   * Utility method for loading all items for a resource from mavenlink
   * @param {Method} loader resource loader, takes page number and returns a promise with the processor data structure
   * @param {*} [options] optional options that will be passed to the loader
   * @return {Promise} array of the loader's result
   */
  loadAllItems(loader, options) {
    return loader(1, options).then(firstPageResult => {
      if (firstPageResult.meta.totalPages === 1) {
        return firstPageResult.data;
      }
      let loadedItems = [firstPageResult];
      for (var i = 2; i <= firstPageResult.meta.totalPages; i++) {
        loadedItems.push(loader(i, options));
      }
      return Promise.all(loadedItems).then(result => {
        return result.reduce((original, value) => {
          original.push(...value.data);
          return original;
        }, []);
      });
    });
  }

}

module.exports = MavenlinkAPI;
