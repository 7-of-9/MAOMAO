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
  parseContent(content: string, heading: string, rootUrl: string) {
    let contents = [];
    const entities = new AllHtmlEntities();
    const trim = String.prototype.trim;
    if (content) {
      // find all tags
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
        const reg = new RegExp(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"\s?([^>]*)>([^<]*)<\/a>/g);
        const findUrlAndTitle = reg.exec(tag);
        if (findUrlAndTitle.length >= 3) {
          items.push({
            title: entities.decode(trim.call(findUrlAndTitle[findUrlAndTitle.length - 1])),
            link: `${rootUrl}${findUrlAndTitle[1]}`,
          })
        }
      });
      if (items.length) {
        contents.push({
          heading,
          items,
        })
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
      const entities = new AllHtmlEntities();
      const $ = result.$;
      const trim = String.prototype.trim;

      let contents = [];
      this.sites.push(rootUrl);

      const that = this;
      const paragraphes = $('h2 .mw-headline').each(function (index) {
        const ingoreHeadings = ['Selected picture', 'Related portals', 'Associated Wikimedia', 'Portals?'];
        let heading = $(this).text();
        heading = trim.call(heading);
        if (ingoreHeadings.indexOf(heading) === -1) {
          const content = $(this).parent().parent().next().html();
          contents = contents.concat(that.parseContent(content, heading, rootUrl));
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
      const paragraphes = $('h2 .mw-headline').each(function (index) {
        // Ignore fisrt heading
        if (index > 0) {
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
