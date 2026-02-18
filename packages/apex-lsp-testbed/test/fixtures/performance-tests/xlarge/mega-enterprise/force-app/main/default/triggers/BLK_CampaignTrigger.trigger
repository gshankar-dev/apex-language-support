trigger BLK_CampaignTrigger on Campaign (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    BLK_BaseService_251.ServiceConfig config =
        new BLK_BaseService_251.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            BLK_Domain_258 domain =
                new BLK_Domain_258();
            BLK_Domain_258.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (BLK_Domain_258.ValidationError err : validation.errors) {
                    if (err.severity == BLK_Domain_258.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        BLK_RecordService_253 service =
            new BLK_RecordService_253();
        BLK_BaseService_251.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'BLK trigger error: ' + error);
            }
        }
    }
}
