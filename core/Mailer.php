<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

require_once __BASEDIR__ . '/vendor/autoload.php';

/**
 * SMTP, over PHPMailer.
 *
 * Credentials come from the environment. They used to be literals in this
 * file, which meant the repository carried a working Gmail app password and
 * every deployment sent as the same personal account.
 *
 * send() returns a bool and never throws. Callers are intake endpoints: a job
 * application must be saved whether or not the notification goes out, so a
 * dead SMTP server has to be a false, not an exception unwinding the request
 * before the row is written.
 */
class Mailer
{
    /** Set by the last failed send, for the caller to log or store. */
    public static string $lastError = '';

    protected static function getMailer(): PHPMailer
    {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host = env('MAIL_HOST', 'localhost');
        $mail->Port = (int) env('MAIL_PORT', 587);
        $mail->CharSet = 'UTF-8';

        $username = env('MAIL_USERNAME', '');
        if ($username !== '') {
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = env('MAIL_PASSWORD', '');
        }

        $secure = strtolower((string) env('MAIL_SECURE', 'tls'));
        if ($secure === 'tls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($secure === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        }

        $from = env('MAIL_FROM_ADDRESS', '') ?: $username;
        if ($from !== '') {
            $mail->setFrom($from, env('MAIL_FROM_NAME', env('APP_NAME', 'Vayu')));
        }

        return $mail;
    }

    /**
     * @param string|string[] $to
     * @param array $options  replyTo:  string|['address' => …, 'name' => …]
     *                        cc, bcc:  string|string[]
     *                        attachments: [['path' => …, 'name' => …], …]
     *                                     or a plain list of paths
     */
    public static function send($to, string $subject, string $body, bool $isHtml = false, array $options = []): bool
    {
        self::$lastError = '';

        $recipients = array_filter(
            array_map('trim', (array) $to),
            static fn ($address) => filter_var($address, FILTER_VALIDATE_EMAIL) !== false
        );

        if (!$recipients) {
            self::$lastError = 'No valid recipient';
            error_log('[Mailer] ' . self::$lastError . ': ' . implode(', ', (array) $to));
            return false;
        }

        try {
            $mail = self::getMailer();

            foreach ($recipients as $address) {
                $mail->addAddress($address);
            }

            foreach ((array) ($options['cc'] ?? []) as $address) {
                $mail->addCC($address);
            }

            foreach ((array) ($options['bcc'] ?? []) as $address) {
                $mail->addBCC($address);
            }

            /* Reply-To matters on the application and enquiry mails: HR hits
               reply and reaches the applicant, not the server's own mailbox. */
            if (!empty($options['replyTo'])) {
                $reply = $options['replyTo'];
                if (is_array($reply)) {
                    $mail->addReplyTo($reply['address'], $reply['name'] ?? '');
                } else {
                    $mail->addReplyTo($reply);
                }
            }

            foreach ((array) ($options['attachments'] ?? []) as $attachment) {
                $path = is_array($attachment) ? ($attachment['path'] ?? '') : $attachment;
                $name = is_array($attachment) ? ($attachment['name'] ?? '') : '';

                if ($path === '' || !is_readable($path)) {
                    /* A CV that has gone missing from disk should not stop HR
                       hearing about the application — the details are in the
                       body, and the panel can still stream the file. */
                    error_log("[Mailer] Attachment not readable, skipped: {$path}");
                    continue;
                }

                $mail->addAttachment($path, $name);
            }

            $mail->isHTML($isHtml);
            $mail->Subject = $subject;
            $mail->Body = $body;

            if ($isHtml) {
                $mail->AltBody = trim(html_entity_decode(strip_tags($body), ENT_QUOTES, 'UTF-8'));
            }

            $mail->send();
            return true;
        } catch (PHPMailerException $e) {
            self::$lastError = $e->getMessage();
            error_log('[Mailer] ' . self::$lastError);
            return false;
        } catch (Throwable $e) {
            self::$lastError = $e->getMessage();
            error_log('[Mailer] ' . self::$lastError);
            return false;
        }
    }

    /** Is there enough configuration to attempt a send at all? */
    public static function isConfigured(): bool
    {
        return env('MAIL_HOST', '') !== ''
            && (env('MAIL_FROM_ADDRESS', '') !== '' || env('MAIL_USERNAME', '') !== '');
    }
}
