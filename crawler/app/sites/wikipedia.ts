import * as Promise from 'bluebird';
import * as _ from 'lodash';
import { AllHtmlEntities } from 'html-entities';
/**
 *
 *
 * @interface CrawlerReponse
 */
interface CrawlerReponse {
  /**
   *
   *
   * @type number
   * @memberOf CrawlerReponse
   */
  statusCode: number;
  /**
   *
   *
   * @type string | buffer
   * @memberOf CrawlerReponse
   */
  body: string;
  /**
   *
   * HTTP headers
   * @type Object
   * @memberOf CrawlerReponse
   */
  headers: Object;
  /**
   * HTTP request
   *
   * @type Object
   * @memberOf CrawlerReponse
   */
  request: Object;
  /**
   * Crawler options
   *
   * @type Object
   * @memberOf CrawlerReponse
   */
  options: Object;
  /**
   *
   *
   * @type jQuery Object
   * @memberOf CrawlerReponse
   */
  $: any;
}

/**
 * Crawler for WikiPedia
 *
 * @export default
 * @class WikiPedia
 */
export default class WikiPedia {
  /**
   *
   *
   * @private
   *
   * @memberOf WikiPedia
   */
  private sites;
  /**
   *
   *
   * @private
   *
   * @memberOf WikiPedia
   */
  private responses;
  /**
   * Creates an instance of WikiPedia.
   *
   *
   * @memberOf WikiPedia
   */
  constructor() {
    this.sites = [];
    this.responses = [];
  }

  /**
   * Parse content for getting url and title
   *
   * @param string content
   * @param string heading
   * @param string rootUrl
   * @returns
   *
   * @memberOf WikiPedia
   */
  parseContent(content: string, heading: string, rootUrl: string, isPortal = true) {
    let contents = [];
    const entities = new AllHtmlEntities();
    const trim = String.prototype.trim;
    if (content) {
      const items = [];
      const reg = new RegExp(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"\s?([^>]*)>([^<]*)<\/a>/g);
      const anchorTags = content.match(reg);
      _.forEach(anchorTags, (tag) => {
        // e.g: "<a href="/wiki/Portal:Religion" title="Portal:Religion">Religion</a>"
        /*
        0: "<a href="/wiki/Portal:Religion" title="Portal:Religion">Religion</a>"
        1: "/wiki/Portal:Religion"
        2: "title="Portal:Religion""
        3 : "Religion"
        */
        const regex = new RegExp(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"\s?([^>]*)>([^<]*)<\/a>/g);
        const findUrlAndTitle = regex.exec(tag);
        if (findUrlAndTitle.length >= 3) {
          const url = String(findUrlAndTitle[1]);
          // Ignore all href='#sth'
          if (url && url[0] !== '#') {
            // Portal page
            if (isPortal) {
              let link = '';
              if (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1) {
                link = url;
              } else {
                link = `${rootUrl}${url}`;
              }
              items.push({
                link,
                doneNLP: false,
                title: entities.decode(trim.call(findUrlAndTitle[findUrlAndTitle.length - 1])),
              });
            } else {
              // No process for sub link such as abc:demo
              if (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1) {
                // Only process for https://en.wikipedia.org
                if (url.indexOf(rootUrl) !== -1 && url.indexOf('index.php') === -1) {
                  items.push({
                    doneNLP: false,
                    link: url,
                    title: entities.decode(trim.call(findUrlAndTitle[findUrlAndTitle.length - 1])),
                  });
                }
              } else if (url.indexOf(':') === -1 && url.indexOf('//') !== 0 && url.indexOf('index.php') === -1) {
                items.push({
                  doneNLP: false,
                  link: `${rootUrl}${url}`,
                  title: entities.decode(trim.call(findUrlAndTitle[findUrlAndTitle.length - 1])),
                });
              }
            }
          }
        }
      });
      if (items.length) {
        contents.push({
          heading,
          items,
          total: items.length,
        });
      }
    }
    return contents;
  }

  /**
   * Get all urls and title from wiki detail page
   *
   * @param string rootUrl
   * @param string title
   * @param CrawlerReponse result
   * @returns
   *
   * @memberOf WikiPedia
   */
  parsePortalDetail(rootUrl: string, title: string, result: CrawlerReponse) {
    return new Promise((resolve, reject) => {
      const $ = result.$;
      const trim = String.prototype.trim;

      let contents = [];
      this.sites.push(rootUrl);

      const that = this;
      $('h2 .mw-headline').each(function (index) {
        const ingoreHeadings = [
          'Interested editors',
          'Featured picture',
          'Selected picture',
          'Related Portals',
          'WikiProjects',
          'Associated Wikimedia',
          'Subportals',
          'Portals?',
        ];
        let heading = $(this).text();
        heading = trim.call(heading);

        // Adhoc for speical case 'Related portals'
        if (ingoreHeadings.indexOf(heading) === -1 && heading.toLowerCase().indexOf('related portals') === -1) {
          const content = $(this).parent().parent().next().html();
          contents = contents.concat(that.parseContent(content, heading, rootUrl, false));
        }
      });
      resolve({ title, contents });
    });
  }

  /**
   *  Get all urls and title from wiki portal
   *
   * @param string rootUrl
   * @param CrawlerReponse result
   * @returns
   *
   * @memberOf WikiPedia
   */
  parsePortalContent(rootUrl: string, result: CrawlerReponse) {
    return new Promise((resolve, reject) => {
      const $ = result.$;
      let contents = [];
      const trim = String.prototype.trim;
      const replace = String.prototype.replace;
      const that = this;
      $('h2 .mw-headline').each(function (index) {
        // Ignore Portal and general reference
        if (index > 1) {
          let heading = $(this).text();
          heading = replace.call(heading, '(see in all page types)', '');
          heading = trim.call(heading);
          const content = $(this).parent().parent().next().html();
          contents = contents.concat(that.parseContent(content, heading, rootUrl));
        }
      });
      this.sites.push(rootUrl);
      this.responses.push({
        rootUrl,
        contents
      });
      resolve(contents);
    });
  }
}
