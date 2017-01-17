import * as Promise from 'bluebird';
import { AllHtmlEntities } from 'html-entities';
interface CrawlerReponse {
  statusCode: number;
  body: string;
  headers: Object;
  request: Object;
  options: Object;
  $: any;
}

export default class WikiPedia {
  private sites;
  private responses;
  constructor() {
    this.sites = [];
    this.responses = [];
  }

  parsePortalContent(rootUrl: string, result: CrawlerReponse) {
    return new Promise((resolve, reject) => {
      // TODO: Parse content on fly
      const entities = new AllHtmlEntities();
      const $ = result.$;
      let contents = [];
      const trim = String.prototype.trim;
      const replace = String.prototype.replace;
      const paragraphes = $('h2 .mw-headline').each(function (index) {
        // Ignore fisrt heading
        if (index > 0) {
          let heading = $(this).text();
          heading = replace.call(heading, '(see in all page types)', '');
          heading = trim.call(heading);
          const content = $(this).parent().parent().next().html();
          if (content) {
            // find all tags
            const items = [];
            const reg = new RegExp(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"\s?([^>]*)>([^<]*)<\/a>/g);
            const anchorTags = content.match(reg);
            const forEach = Array.prototype.forEach;
            forEach.call(anchorTags, (tag) => {
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
        }
      });
      this.sites.push(rootUrl);
      this.responses.push({
        rootUrl,
        contents
      });
      resolve(this.responses);
    });
  }
}
