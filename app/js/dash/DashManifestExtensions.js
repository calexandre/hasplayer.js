/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
Dash.dependencies.DashManifestExtensions = function () {
    "use strict";
    this.timelineConverter = undefined;
};

Dash.dependencies.DashManifestExtensions.prototype = {
    constructor: Dash.dependencies.DashManifestExtensions,

    getIsAudio: function (adaptation) {
        "use strict";
        var i,
            len,
            col = adaptation.ContentComponent_asArray,
            representation,
            result = false,
            found = false;

        if (col) {
            for (i = 0, len = col.length; i < len; i += 1) {
                if (col[i].contentType === "audio") {
                    result = true;
                    found = true;
                }
            }
        }

        if (adaptation.hasOwnProperty("mimeType")) {
            result = adaptation.mimeType.indexOf("audio") !== -1;
            found = true;
        }

        // couldn't find on adaptationset, so check a representation
        if (!found) {
            i = 0;
            len = adaptation.Representation_asArray.length;
            while (!found && i < len) {
                representation = adaptation.Representation_asArray[i];

                if (representation.hasOwnProperty("mimeType")) {
                    result = representation.mimeType.indexOf("audio") !== -1;
                    found = true;
                }

                i += 1;
            }
        }

        // TODO : Add the type here so that somebody who has access to the adapatation set can check it.
        // THIS IS A HACK for a bug in DashMetricsExtensions.
        // See the note in DashMetricsExtensions.adaptationIsType().
        if (result) {
            adaptation.type = "audio";
        }

        return Q.when(result);
    },

    getIsVideo: function (adaptation) {
        "use strict";
        var i,
            len,
            col = adaptation.ContentComponent_asArray,
            representation,
            result = false,
            found = false;

        if (col) {
            for (i = 0, len = col.length; i < len; i += 1) {
                if (col[i].contentType === "video") {
                    result = true;
                    found = true;
                }
            }
        }

        if (adaptation.hasOwnProperty("mimeType")) {
            result = adaptation.mimeType.indexOf("video") !== -1;
            found = true;
        }

        // couldn't find on adaptationset, so check a representation
        if (!found) {
            i = 0;
            len = adaptation.Representation_asArray.length;
            while (!found && i < len) {
                representation = adaptation.Representation_asArray[i];

                if (representation.hasOwnProperty("mimeType")) {
                    result = representation.mimeType.indexOf("video") !== -1;
                    found = true;
                }

                i += 1;
            }
        }

        // TODO : Add the type here so that somebody who has access to the adapatation set can check it.
        // THIS IS A HACK for a bug in DashMetricsExtensions.
        // See the note in DashMetricsExtensions.adaptationIsType().
        if (result) {
            adaptation.type = "video";
        }

        return Q.when(result);
    },

    getIsText: function (adaptation) {
        "use strict";
        var i,
            len,
            col = adaptation.ContentComponent_asArray,
            representation,
            result = false,
            found = false;

        if (col) {
            for (i = 0, len = col.length; i < len; i += 1) {
                if (col[i].contentType === "text") {
                    result = true;
                    found = true;
                }
            }
        }

        if (adaptation.hasOwnProperty("mimeType")) {
            result = adaptation.mimeType.indexOf("text") !== -1;
            found = true;
        }

        // couldn't find on adaptationset, so check a representation
        if (!found) {
            i = 0;
            len = adaptation.Representation_asArray.length;
            while (!found && i < len) {
                representation = adaptation.Representation_asArray[i];

                if (representation.hasOwnProperty("mimeType")) {
                    result = representation.mimeType.indexOf("text") !== -1;
                    found = true;
                }

                i += 1;
            }
        }

        return Q.when(result);
    },

    getIsTextTrack: function(type) {
        return (type === "text/vtt" || type === "application/ttml+xml");
    },

    getIsMain: function (/*adaptation*/) {
        "use strict";
        // TODO : Check "Role" node.
        // TODO : Use this somewhere.
        return Q.when(false);
    },

    processAdaptation: function (adaptation) {
        "use strict";
        if (adaptation.Representation_asArray !== undefined && adaptation.Representation_asArray !== null) {
            adaptation.Representation_asArray.sort(function(a, b) {
                return a.bandwidth - b.bandwidth;
            });
        }

        return adaptation;
    },

    getDataForId: function (id, manifest, periodIndex) {
        "use strict";
        var adaptations = manifest.Period_asArray[periodIndex].AdaptationSet_asArray,
            i,
            len;

        for (i = 0, len = adaptations.length; i < len; i += 1) {
            if (adaptations[i].hasOwnProperty("id") && adaptations[i].id === id) {
                return Q.when(adaptations[i]);
            }
        }

        return Q.when(null);
    },

    getDataForIndex: function (index, manifest, periodIndex) {
        "use strict";
        var adaptations = manifest.Period_asArray[periodIndex].AdaptationSet_asArray;

        return Q.when(adaptations[index]);
    },

    getDataIndex: function (data, manifest, periodIndex) {
        "use strict";

        var adaptations = manifest.Period_asArray[periodIndex].AdaptationSet_asArray,
            i,
            len;

        for (i = 0, len = adaptations.length; i < len; i += 1) {
            if (adaptations[i] === data) {
                return Q.when(i);
            }
        }

        return Q.when(-1);
    },

    getVideoData: function (manifest, periodIndex) {
        "use strict";
        //return Q.when(null);
        //------------------------------------
        var self = this,
            adaptations = manifest.Period_asArray[periodIndex].AdaptationSet_asArray,
            i,
            len,
            deferred = Q.defer(),
            funcs = [];

        for (i = 0, len = adaptations.length; i < len; i += 1) {
            funcs.push(this.getIsVideo(adaptations[i]));
        }
        Q.all(funcs).then(
            function (results) {
                var found = false;
                for (i = 0, len = results.length; i < len; i += 1) {
                    if (results[i] === true) {
                        found = true;
                        deferred.resolve(self.processAdaptation(adaptations[i]));
                    }
                }
                if (!found) {
                    deferred.resolve(null);
                }
            }
        );

        return deferred.promise;
    },

    getTextData: function (manifest, periodIndex) {
        "use strict";
        //return Q.when(null);
        //------------------------------------
        var self = this,
            adaptations = manifest.Period_asArray[periodIndex].AdaptationSet_asArray,
            i,
            len,
            deferred = Q.defer(),
            funcs = [];

        for (i = 0, len = adaptations.length; i < len; i += 1) {
            funcs.push(this.getIsText(adaptations[i]));
        }
        Q.all(funcs).then(
            function (results) {
                var found = false;
                for (i = 0, len = results.length; i < len; i += 1) {
                    if (results[i] === true) {
                        found = true;
                        deferred.resolve(self.processAdaptation(adaptations[i]));
                    }
                }
                if (!found) {
                    deferred.resolve(null);
                }
            }
        );

        return deferred.promise;
    },

    getAudioDatas: function (manifest, periodIndex) {
        "use strict";
        //return Q.when(null);
        //------------------------------------
        var self = this,
            adaptations = manifest.Period_asArray[periodIndex].AdaptationSet_asArray,
            i,
            len,
            deferred = Q.defer(),
            funcs = [];

        for (i = 0, len = adaptations.length; i < len; i += 1) {
            funcs.push(this.getIsAudio(adaptations[i]));
        }

        Q.all(funcs).then(
            function (results) {
                var datas = [];
                for (i = 0, len = results.length; i < len; i += 1) {
                    if (results[i] === true) {
                        datas.push(self.processAdaptation(adaptations[i]));
                    }
                }
                deferred.resolve(datas);
            }
        );

        return deferred.promise;
    },

    getPrimaryAudioData: function (manifest, periodIndex) {
        "use strict";
        var i,
            len,
            deferred = Q.defer(),
            funcs = [],
            self = this;

        this.getAudioDatas(manifest, periodIndex).then(
            function (datas) {
                if (!datas || datas.length === 0) {
                    deferred.resolve(null);
                }

                for (i = 0, len = datas.length; i < len; i += 1) {
                    funcs.push(self.getIsMain(datas[i]));
                }

                Q.all(funcs).then(
                    function (results) {
                        var found = false;
                        for (i = 0, len = results.length; i < len; i += 1) {
                            if (results[i] === true) {
                                found = true;
                                deferred.resolve(self.processAdaptation(datas[i]));
                            }
                        }
                        if (!found) {
                            deferred.resolve(datas[0]);
                        }
                    }
                );
            }
        );

        return deferred.promise;
    },

    getCodec: function (data) {
        "use strict";
        var representation = data.Representation_asArray[0],
            codec = (representation.mimeType + ';codecs="' + representation.codecs + '"');
        return Q.when(codec);
    },

    getMimeType: function (data) {
        "use strict";
        return Q.when(data.Representation_asArray[0].mimeType);
    },

    getKID: function (data) {
        "use strict";

        if (!data || !data.hasOwnProperty("cenc:default_KID")) {
            return null;
        }
        return data["cenc:default_KID"];
    },

    getContentProtectionData: function (data) {
        "use strict";
        if (!data || !data.hasOwnProperty("ContentProtection_asArray") || data.ContentProtection_asArray.length === 0) {
            return Q.when(null);
        }
        return Q.when(data.ContentProtection_asArray);
    },

    getIsDynamic: function (manifest) {
        "use strict";
        var isDynamic = false,
            LIVE_TYPE = "dynamic";

        if (manifest.hasOwnProperty("type")) {
            isDynamic = (manifest.type === LIVE_TYPE);
        }

        return isDynamic;
    },

    getIsDVR: function (manifest) {
        "use strict";
        var isDynamic = this.getIsDynamic(manifest),
            containsDVR,
            isDVR;

        containsDVR = !isNaN(manifest.timeShiftBufferDepth);
        isDVR = (isDynamic && containsDVR);

        return Q.when(isDVR);
    },

    getIsOnDemand: function (manifest) {
        "use strict";
        var isOnDemand = false;

        if (manifest.profiles && manifest.profiles.length > 0) {
            isOnDemand = (manifest.profiles.indexOf("urn:mpeg:dash:profile:isoff-on-demand:2011") !== -1);
        }

        return Q.when(isOnDemand);
    },

    getDuration: function (manifest) {
        var mpdDuration,
            self = this,
            isDynamic = self.getIsDynamic(manifest),
            deferred = Q.defer();

        if (isDynamic) {
            mpdDuration = Number.POSITIVE_INFINITY;
        } else {
            mpdDuration = manifest.mediaPresentationDuration;
        }
        deferred.resolve(mpdDuration);

        return deferred.promise;
    },

    getBandwidth: function (representation) {
        "use strict";
        return Q.when(representation.bandwidth);
    },

    getRefreshDelay: function (manifest) {
        "use strict";
        var delay = NaN;

        if (manifest.hasOwnProperty("minimumUpdatePeriod")) {
            delay = parseFloat(manifest.minimumUpdatePeriod);
        }

        return Q.when(delay);
    },

    getRepresentationCount: function (adaptation) {
        "use strict";
        return Q.when(adaptation.Representation_asArray.length);
    },

    getRepresentationFor: function (index, data) {
        "use strict";
        return Q.when(data.Representation_asArray[index]);
    },

    getRepresentationsForAdaptation: function(manifest, adaptation) {
        var a = manifest.Period_asArray[adaptation.period.index].AdaptationSet_asArray[adaptation.index],
            self = this,
            representations = [],
            deferred = Q.defer(),
            representation,
            initialization,
            segmentInfo,
            r;

        for (var i = 0; i < a.Representation_asArray.length; i += 1) {
            r = a.Representation_asArray[i];
            representation = new Dash.vo.Representation();
            representation.index = i;
            representation.adaptation = adaptation;

            if (r.hasOwnProperty("id")) {
                representation.id = r.id;
            }

            if (r.hasOwnProperty("SegmentBase")) {
                segmentInfo = r.SegmentBase;
                representation.segmentInfoType = "SegmentBase";
            }
            else if (r.hasOwnProperty("SegmentList")) {
                segmentInfo = r.SegmentList;
                representation.segmentInfoType = "SegmentList";
                if (isNaN(adaptation.period.liveEdge)) {
                    adaptation.period.liveEdge = this.timelineConverter.calcPresentationTimeFromWallTime.call(this, manifest.mpdLoadedTime, adaptation.period, true);
                }
            }
            else if (r.hasOwnProperty("SegmentTemplate")) {
                segmentInfo = r.SegmentTemplate;

                if (segmentInfo.hasOwnProperty("SegmentTimeline")) {
                    representation.segmentInfoType = "SegmentTimeline";
                } else {
                    representation.segmentInfoType = "SegmentTemplate";
                    if (isNaN(adaptation.period.liveEdge)) {
                        adaptation.period.liveEdge = this.timelineConverter.calcPresentationTimeFromWallTime.call(this, manifest.mpdLoadedTime, adaptation.period, true);
                    }
                }

                if (segmentInfo.hasOwnProperty("initialization")) {
                    representation.initialization = segmentInfo.initialization.split("$Bandwidth$")
                        .join(r.bandwidth).split("$RepresentationID$").join(r.id);
                }
            } else {
                segmentInfo = r.BaseURL;
                representation.segmentInfoType = "BaseURL";
            }

            if (segmentInfo.hasOwnProperty("Initialization")) {
                initialization = segmentInfo.Initialization;
                if (initialization.hasOwnProperty("sourceURL")) {
                    representation.initialization = initialization.sourceURL;
                } else if (initialization.hasOwnProperty("range")) {
                    representation.initialization = r.BaseURL;
                    representation.range = initialization.range;
                }
            } else if (r.hasOwnProperty("mimeType") && self.getIsTextTrack(r.mimeType)) {
                representation.initialization = r.BaseURL;
                representation.range = 0;
            }

            if (segmentInfo.hasOwnProperty("timescale")) {
                representation.timescale = segmentInfo.timescale;
            }
            if (segmentInfo.hasOwnProperty("duration")) {
                representation.segmentDuration = segmentInfo.duration / representation.timescale;
            }
            if (segmentInfo.hasOwnProperty("startNumber")) {
                representation.startNumber = segmentInfo.startNumber;
            }
            if (segmentInfo.hasOwnProperty("indexRange")) {
                representation.indexRange = segmentInfo.indexRange;
            }
            if (segmentInfo.hasOwnProperty("presentationTimeOffset")) {
                representation.presentationTimeOffset = segmentInfo.presentationTimeOffset / representation.timescale;
            }

            representation.MSETimeOffset = self.timelineConverter.calcMSETimeOffset(representation);
            representations.push(representation);
        }

        deferred.resolve(representations);

        return deferred.promise;
    },

    getAdaptationsForPeriod: function(manifest, period) {
        var p = manifest.Period_asArray[period.index],
            adaptations = [],
            adaptationSet;

        for (var i = 0; i < p.AdaptationSet_asArray.length; i += 1) {
            adaptationSet = new Dash.vo.AdaptationSet();
            adaptationSet.index = i;
            adaptationSet.period = period;
            adaptations.push(adaptationSet);
        }

        return Q.when(adaptations);
    },

    getRegularPeriods: function (manifest, mpd) {
        var self = this,
            deferred = Q.defer(),
            periods = [],
            isDynamic = self.getIsDynamic(manifest),
            i,
            len,
            p1 = null,
            p = null,
            vo1 = null,
            vo = null;

        for (i = 0, len = manifest.Period_asArray.length; i < len; i += 1) {
            p = manifest.Period_asArray[i];

            // If the attribute @start is present in the Period, then the
            // Period is a regular Period and the PeriodStart is equal
            // to the value of this attribute.
            if (p.hasOwnProperty("start")){
                vo = new Dash.vo.Period();
                vo.start = p.start;
            }
            // If the @start attribute is absent, but the previous Period
            // element contains a @duration attribute then then this new
            // Period is also a regular Period. The start time of the new
            // Period PeriodStart is the sum of the start time of the previous
            // Period PeriodStart and the value of the attribute @duration
            // of the previous Period.
            else if (p1 !== null && p.hasOwnProperty("duration")){
                vo = new Dash.vo.Period();
                vo.start = vo1.start + vo1.duration;
                vo.duration = p.duration;
            }
            // If (i) @start attribute is absent, and (ii) the Period element
            // is the first in the MPD, and (iii) the MPD@type is 'static',
            // then the PeriodStart time shall be set to zero.
            else if (i === 0 && !isDynamic) {
                vo = new Dash.vo.Period();
                vo.start = 0;
            }

            // The Period extends until the PeriodStart of the next Period.
            // The difference between the PeriodStart time of a Period and
            // the PeriodStart time of the following Period.
            if (vo1 !== null && isNaN(vo1.duration))
            {
                vo1.duration = vo.start - vo1.start;
            }

            if (vo !== null && p.hasOwnProperty("id")){
                vo.id = p.id;
            }

            if (vo !== null){
                vo.index = i;
                vo.mpd = mpd;
                periods.push(vo);
            }

            p1 = p;
            p = null;
            vo1 = vo;
            vo = null;
        }
        // The last Period extends until the end of the Media Presentation.
        // The difference between the PeriodStart time of the last Period
        // and the mpd duration
        if (vo1 !== null && isNaN(vo1.duration)) {
            self.getEndTimeForLastPeriod(manifest, vo1).then(
                function(periodEndTime) {
                    vo1.duration = periodEndTime - vo1.start;
                    deferred.resolve(periods);
                }
            );
        } else {
            deferred.resolve(periods);
        }

        return Q.when(deferred.promise);
    },

    getMpd: function(manifest) {
        var mpd = new Dash.vo.Mpd();

        mpd.manifest = manifest;

        if (manifest.hasOwnProperty("availabilityStartTime")) {
            mpd.availabilityStartTime = new Date(manifest.availabilityStartTime.getTime());
        } else {
            mpd.availabilityStartTime = new Date(manifest.mpdLoadedTime.getTime());
        }

        if (manifest.hasOwnProperty("availabilityEndTime")) {
            mpd.availabilityEndTime = new Date(manifest.availabilityEndTime.getTime());
        }

        if (manifest.hasOwnProperty("suggestedPresentationDelay")) {
            mpd.suggestedPresentationDelay = manifest.suggestedPresentationDelay;
        }

        if (manifest.hasOwnProperty("timeShiftBufferDepth")) {
            mpd.timeShiftBufferDepth = manifest.timeShiftBufferDepth;
        }

        return Q.when(mpd);
    },

    getEndTimeForLastPeriod: function(manifest, lastPeriod) {
        var periodEnd;

        //if the MPD@mediaPresentationDuration attribute is present, then PeriodEndTime is defined as the end time of the Media Presentation.
        // if the MPD@mediaPresentationDuration attribute is not present, then PeriodEndTime is defined as FetchTime + MPD@minimumUpdatePeriod

        if (manifest.mediaPresentationDuration) {
            periodEnd = manifest.mediaPresentationDuration;
        } else {
            periodEnd = this.timelineConverter.calcPresentationTimeFromWallTime(manifest.mpdLoadedTime, lastPeriod, true) + manifest.minimumUpdatePeriod;
        }

        return Q.when(periodEnd);
    }
};
