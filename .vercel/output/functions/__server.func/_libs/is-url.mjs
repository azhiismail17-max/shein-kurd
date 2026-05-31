var isUrl_1;
var hasRequiredIsUrl;
function requireIsUrl() {
  if (hasRequiredIsUrl) return isUrl_1;
  hasRequiredIsUrl = 1;
  isUrl_1 = isUrl;
  var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
  var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
  var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;
  function isUrl(string) {
    if (typeof string !== "string") {
      return false;
    }
    var match = string.match(protocolAndDomainRE);
    if (!match) {
      return false;
    }
    var everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
      return false;
    }
    if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
      return true;
    }
    return false;
  }
  return isUrl_1;
}
export {
  requireIsUrl as r
};
